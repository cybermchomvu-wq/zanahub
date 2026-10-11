import { useRef, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Upload,
  X,
  Download,
  Plus,
  GripVertical,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import './PDFMerger.css';

export default function PDFMerger({ onBack }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);

  function addFiles(selectedFiles) {
    const incoming = Array.from(selectedFiles || []);
    const pdfs = incoming.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfs.length !== incoming.length) {
      setError('Only PDF files are accepted. Non-PDF files were skipped.');
    } else {
      setError('');
    }

    setFiles((previous) => [...previous, ...pdfs]);
    setNotice('');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setResultSize(0);
  }

  function removeFile(index) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return '';
    });
    setResultSize(0);
    setNotice('');
  }

  function moveFile(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= files.length) return;

    setFiles((previous) => {
      const updated = [...previous];
      [updated[index], updated[destination]] = [
        updated[destination],
        updated[index],
      ];
      return updated;
    });
  }

  async function mergePDFs() {
    if (files.length < 2) {
      setError('Add at least two PDF files to merge.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const merged = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const source = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(
          source,
          source.getPageIndices()
        );

        pages.forEach((page) => merged.addPage(page));
      }

      const output = await merged.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      setResultSize(blob.size);
      setNotice('Your PDFs have been merged successfully!');
    } catch (err) {
      console.error(err);
      setError(
        'Could not merge these PDFs. One may be damaged or password-protected.'
      );
    } finally {
      setBusy(false);
    }
  }

  function resetTool() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl('');
    setResultSize(0);
    setNotice('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <section className="pdf-tool">
      <button className="pdf-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to all tools
      </button>

      <div className="pdf-heading">
        <div className="pdf-heading-icon">
          <FileText size={28} />
        </div>
        <div>
          <h1>PDF Merger</h1>
          <p>Combine multiple PDF documents into one file.</p>
        </div>
      </div>

      <div className="pdf-privacy">
        <CheckCircle2 size={18} />
        Your files stay on your device. Processing happens in your browser.
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        hidden
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <button
        className="pdf-upload"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <Upload size={30} />
        <strong>Choose PDF files</strong>
        <span>Click here to add documents</span>
        <span className="pdf-upload-small">Select two or more PDF files</span>
      </button>

      <div className="pdf-list-header">
        <div>
          <h2>Your documents</h2>
          <span>{files.length} PDF file{files.length === 1 ? '' : 's'}</span>
        </div>
        <button
          className="pdf-add"
          onClick={() => inputRef.current?.click()}
        >
          <Plus size={16} /> Add files
        </button>
      </div>

      {files.length === 0 ? (
        <div className="pdf-empty">
          <FileText size={34} />
          <p>No PDF files added yet.</p>
        </div>
      ) : (
        <div className="pdf-file-list">
          {files.map((file, index) => (
            <div className="pdf-file-row" key={`${file.name}-${index}`}>
              <GripVertical className="pdf-grip" size={19} />
              <div className="pdf-file-icon">
                <FileText size={22} />
              </div>
              <div className="pdf-file-info">
                <strong>{file.name}</strong>
                <span>{formatSize(file.size)}</span>
              </div>
              <div className="pdf-order">
                <button
                  title="Move up"
                  aria-label={`Move ${file.name} up`}
                  disabled={index === 0}
                  onClick={() => moveFile(index, -1)}
                >
                  ↑
                </button>
                <button
                  title="Move down"
                  aria-label={`Move ${file.name} down`}
                  disabled={index === files.length - 1}
                  onClick={() => moveFile(index, 1)}
                >
                  ↓
                </button>
              </div>
              <button
                className="pdf-remove"
                title="Remove file"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="pdf-error">{error}</div>}
      {notice && <div className="pdf-success">{notice}</div>}

      <div className="pdf-actions">
        <button className="pdf-reset" onClick={resetTool}>
          Clear all
        </button>
        <button
          className="pdf-merge"
          onClick={mergePDFs}
          disabled={busy || files.length < 2}
        >
          {busy ? (
            <>
              <LoaderCircle className="pdf-spinner" size={18} />
              Merging PDFs...
            </>
          ) : (
            <>
              <FileText size={18} />
              Merge {files.length} PDFs
            </>
          )}
        </button>
      </div>

      {resultUrl && (
        <div className="pdf-result">
          <div className="pdf-result-icon">
            <CheckCircle2 size={25} />
          </div>
          <div className="pdf-result-info">
            <strong>merged-document.pdf</strong>
            <span>{formatSize(resultSize)} · Ready to download</span>
          </div>
          <a
            className="pdf-download"
            href={resultUrl}
            download="zanahub-merged.pdf"
          >
            <Download size={18} /> Download
          </a>
        </div>
      )}

      <p className="pdf-tip">
        Tip: Arrange your documents in the order you want them to appear in the
        final PDF before merging.
      </p>
    </section>
  );
}
