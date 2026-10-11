import { useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  ArrowLeft,
  Upload,
  FileText,
  Scissors,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import './PDFSplitter.css';

export default function PDFSplitter({ onBack }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState('1');
  const [mode, setMode] = useState('extract');
  const [outputs, setOutputs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);
  const outputUrls = useRef([]);

  useEffect(() => {
    return () => {
      outputUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearOutputs() {
    outputUrls.current.forEach((url) => URL.revokeObjectURL(url));
    outputUrls.current = [];
    setOutputs([]);
    setSuccess('');
  }

  async function handleFile(selectedFile) {
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Please select a PDF file.');
      return;
    }

    setBusy(true);
    setError('');
    clearOutputs();

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const pages = pdf.getPageCount();

      if (pages < 1) {
        throw new Error('This PDF does not contain any pages.');
      }

      setFile(selectedFile);
      setPageCount(pages);
      setPageRange(pages === 1 ? '1' : `1-${pages}`);
    } catch (err) {
      setFile(null);
      setPageCount(0);
      setError(
        err.message?.toLowerCase().includes('encrypt')
          ? 'This PDF is encrypted or password-protected. Please use an unlocked PDF.'
          : `Could not open this PDF. ${err.message || 'Please try another file.'}`
      );
    } finally {
      setBusy(false);
    }
  }

  function parsePageRange(value, totalPages) {
    const parts = value.split(',').map((part) => part.trim()).filter(Boolean);

    if (!parts.length) {
      throw new Error('Enter at least one page number or range.');
    }

    const pages = new Set();

    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        const page = Number(part);

        if (page < 1 || page > totalPages) {
          throw new Error(`Page ${page} is outside the PDF's page range.`);
        }

        pages.add(page - 1);
        continue;
      }

      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);

      if (!rangeMatch) {
        throw new Error('Use page numbers or ranges, such as 1,3,5-7.');
      }

      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);

      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`The range "${part}" is invalid for this PDF.`);
      }

      for (let page = start; page <= end; page++) {
        pages.add(page - 1);
      }
    }

    return [...pages].sort((a, b) => a - b);
  }

  async function createOutput() {
    if (!file) {
      setError('Upload a PDF before splitting it.');
      return;
    }

    setBusy(true);
    setError('');
    clearOutputs();

    try {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const total = sourcePdf.getPageCount();
      const baseName = file.name.replace(/\.pdf$/i, '');

      if (mode === 'extract') {
        const selectedPages = parsePageRange(pageRange, total);
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, selectedPages);

        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        outputUrls.current.push(url);
        setOutputs([{
          name: `${baseName}-extracted.pdf`,
          url,
          pages: selectedPages.length,
        }]);
        setSuccess(`${selectedPages.length} page(s) extracted successfully.`);
      } else {
        const newOutputs = [];

        for (let index = 0; index < total; index++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [index]);
          newPdf.addPage(page);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          outputUrls.current.push(url);
          newOutputs.push({
            name: `${baseName}-page-${index + 1}.pdf`,
            url,
            pages: 1,
          });
        }

        setOutputs(newOutputs);
        setSuccess(`Created ${total} individual PDF files.`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while splitting the PDF.');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    clearOutputs();
    setFile(null);
    setPageCount(0);
    setPageRange('1');
    setError('');

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="splitter-page">
      <button className="splitter-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="splitter-heading">
        <div className="splitter-heading-icon">
          <Scissors size={27} />
        </div>
        <div>
          <h1>PDF Splitter</h1>
          <p>Extract selected pages or separate every page into its own PDF.</p>
        </div>
      </div>

      <div className="splitter-layout">
        <section className="splitter-panel">
          <h2>1. Upload your PDF</h2>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <button
            className="splitter-upload"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Upload size={30} />
            <strong>{file ? 'Choose a different PDF' : 'Click to upload a PDF'}</strong>
            <span>PDF documents are processed in your browser.</span>
          </button>

          {file && (
            <div className="splitter-file">
              <FileText size={24} />
              <div className="splitter-file-details">
                <strong>{file.name}</strong>
                <span>{pageCount} page(s) · {(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <CheckCircle size={20} className="splitter-check" />
            </div>
          )}

          <h2 className="splitter-section-title">2. Choose how to split</h2>

          <div className="splitter-modes">
            <button
              className={`splitter-mode ${mode === 'extract' ? 'selected' : ''}`}
              onClick={() => {
                setMode('extract');
                clearOutputs();
                setError('');
              }}
            >
              <FileText size={22} />
              <strong>Extract pages</strong>
              <span>Save chosen pages into one new PDF.</span>
            </button>

            <button
              className={`splitter-mode ${mode === 'individual' ? 'selected' : ''}`}
              onClick={() => {
                setMode('individual');
                clearOutputs();
                setError('');
              }}
            >
              <Scissors size={22} />
              <strong>Split every page</strong>
              <span>Create a separate PDF for each page.</span>
            </button>
          </div>

          {mode === 'extract' && (
            <div className="splitter-range">
              <label htmlFor="splitter-pages">Pages to extract</label>
              <input
                id="splitter-pages"
                type="text"
                value={pageRange}
                onChange={(event) => {
                  setPageRange(event.target.value);
                  clearOutputs();
                  setError('');
                }}
                placeholder="Example: 1,3,5-7"
                disabled={!file || busy}
              />
              <p>
                {pageCount
                  ? `Available pages: 1–${pageCount}. Example: 1,3,5-7`
                  : 'Upload a PDF to see the available page range.'}
              </p>
            </div>
          )}

          {mode === 'individual' && pageCount > 30 && (
            <p className="splitter-warning">
              This PDF has {pageCount} pages. Creating individual files may take a while.
            </p>
          )}

          {error && (
            <div className="splitter-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button
            className="splitter-primary"
            onClick={createOutput}
            disabled={!file || busy}
          >
            {busy ? (
              <><RefreshCw size={18} className="splitter-spin" /> Processing PDF...</>
            ) : (
              <><Scissors size={18} /> {mode === 'extract' ? 'Extract Pages' : 'Split Every Page'}</>
            )}
          </button>
        </section>

        <section className="splitter-panel splitter-results">
          <h2>3. Download your files</h2>

          {!outputs.length ? (
            <div className="splitter-empty">
              <FileText size={48} />
              <strong>Your PDF files will appear here</strong>
              <p>Upload a PDF and choose how you want to split it.</p>
            </div>
          ) : (
            <>
              <div className="splitter-success">
                <CheckCircle size={19} />
                <span>{success}</span>
              </div>

              <div className="splitter-output-list">
                {outputs.map((output) => (
                  <div className="splitter-output" key={output.name}>
                    <FileText size={22} />
                    <div className="splitter-output-details">
                      <strong>{output.name}</strong>
                      <span>{output.pages} page(s)</span>
                    </div>
                    <a
                      className="splitter-download-icon"
                      href={output.url}
                      download={output.name}
                      aria-label={`Download ${output.name}`}
                      title={`Download ${output.name}`}
                    >
                      <Download size={19} />
                    </a>
                  </div>
                ))}
              </div>

              <button className="splitter-secondary" onClick={reset}>
                Split another PDF
              </button>
            </>
          )}

          <div className="splitter-privacy">
            🔒 Your PDF is processed locally in your browser. It is not uploaded to our server.
          </div>
        </section>
      </div>
    </div>
  );
}
