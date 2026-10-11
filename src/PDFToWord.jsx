import { useState } from 'react';
import { FileText, Upload, Download, LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import './PDFToWord.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFToWord() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFile = (selected) => {
    setError('');
    setMessage('');
    setProgress(0);

    if (!selected) return;

    if (selected.type !== 'application/pdf' &&
        !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const convertPDF = async () => {
    if (!file || busy) return;

    setBusy(true);
    setError('');
    setMessage('');

    let pdf;

    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({ data });
      pdf = await loadingTask.promise;

      const paragraphs = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setProgress(Math.round(((pageNumber - 1) / pdf.numPages) * 80));

        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();

        const lines = [];
        let currentLine = [];
        let lastY = null;

        const items = content.items
          .filter(item => typeof item.str === 'string')
          .sort((a, b) => {
            const yDifference = b.transform[5] - a.transform[5];
            return Math.abs(yDifference) > 3
              ? yDifference
              : a.transform[4] - b.transform[4];
          });

        for (const item of items) {
          const y = item.transform[5];

          if (lastY !== null && Math.abs(y - lastY) > 3) {
            const lineText = currentLine.join('').trim();
            if (lineText) lines.push(lineText);
            currentLine = [];
          }

          currentLine.push(item.str);

          if (item.hasEOL) {
            const lineText = currentLine.join('').trim();
            if (lineText) lines.push(lineText);
            currentLine = [];
            lastY = null;
          } else {
            lastY = y;
          }
        }

        const remaining = currentLine.join('').trim();
        if (remaining) lines.push(remaining);

        if (pageNumber > 1) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Page ${pageNumber}`,
                  bold: true,
                  color: '7C3AED',
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              pageBreakBefore: true,
            })
          );
        }

        if (lines.length) {
          for (const line of lines) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: line })],
                spacing: { after: 120 },
              })
            );
          }
        } else {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '[No selectable text found on this page.]',
                  italics: true,
                  color: '777777',
                }),
              ],
            })
          );
        }

        setProgress(Math.round((pageNumber / pdf.numPages) * 80));
      }

      if (!paragraphs.length) {
        throw new Error('No text could be extracted from this PDF.');
      }

      setProgress(85);

      const docxDocument = new Document({
        creator: 'ZanaHub',
        title: file.name.replace(/\.pdf$/i, ''),
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(docxDocument);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.pdf$/i, '')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setProgress(100);
      setMessage('Conversion complete! Your Word document has been downloaded.');
    } catch (err) {
      console.error('PDF to Word conversion failed:', err);
      setError(
        err?.message?.includes('password')
          ? 'This PDF is password-protected. Please use an unlocked PDF.'
          : 'Conversion failed. Try another PDF file.'
      );
    } finally {
      if (pdf) {
        try {
          await pdf.destroy();
        } catch {
          // The conversion result is already handled.
        }
      }
      setBusy(false);
    }
  };

  return (
    <div className="pdf-word-tool">
      <div className="pdf-word-heading">
        <div className="pdf-word-icon"><FileText size={28} /></div>
        <div>
          <h2>PDF to Word Converter</h2>
          <p>Turn PDF text into an editable Word document.</p>
        </div>
      </div>

      <label className="pdf-word-upload">
        <Upload size={30} />
        <strong>{file ? file.name : 'Choose a PDF file'}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Click here to browse your files'}</span>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) => handleFile(event.target.files?.[0])}
          disabled={busy}
        />
      </label>

      {file && (
        <div className="pdf-word-file">
          <FileText size={22} />
          <div>
            <strong>{file.name}</strong>
            <span>Ready to convert</span>
          </div>
        </div>
      )}

      {busy && (
        <div className="pdf-word-progress">
          <div><span>Converting PDF...</span><span>{progress}%</span></div>
          <div className="pdf-word-progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="pdf-word-notice error"><AlertCircle size={19} />{error}</div>}
      {message && <div className="pdf-word-notice success"><CheckCircle size={19} />{message}</div>}

      <button className="pdf-word-button" onClick={convertPDF} disabled={!file || busy}>
        {busy ? <LoaderCircle className="pdf-word-spin" size={20} /> : <Download size={20} />}
        {busy ? 'Converting...' : 'Convert to Word'}
      </button>

      <p className="pdf-word-note">
        Your file is processed in your browser. Scanned PDFs that contain only images
        may require OCR. Complex layouts, tables and original formatting may not be
        preserved exactly.
      </p>
    </div>
  );
}
