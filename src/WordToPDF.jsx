import { useRef, useState } from 'react';
import mammoth from 'mammoth/mammoth.browser';
import html2pdf from 'html2pdf.js';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';
import './WordToPDF.css';

export default function WordToPDF({ onBack }) {
  const [fileName, setFileName] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pageSize, setPageSize] = useState('a4');
  const [pageOrientation, setPageOrientation] = useState('portrait');
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setMessage('Please choose a Microsoft Word .docx file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessage('Please choose a document smaller than 20 MB.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const safeHtml = DOMPurify.sanitize(result.value, {
        USE_PROFILES: { html: true },
      });

      if (!safeHtml.trim()) {
        throw new Error('This document does not contain readable text.');
      }

      setPreviewHtml(safeHtml);
      setFileName(file.name.replace(/\.docx$/i, ''));
      setMessage(
        result.messages.length
          ? 'Preview ready. Some Word formatting may not be preserved.'
          : 'Document ready to convert.'
      );
    } catch (error) {
      console.error('Word document preview failed:', error);
      setPreviewHtml('');
      setFileName('');
      setMessage(
        'Could not read this document. Please try a valid .docx file.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function convertToPDF() {
    if (!previewRef.current || !previewHtml || loading) return;

    setLoading(true);
    setMessage('');

    try {
      const options = {
        margin: [12, 12, 12, 12],
        filename: `${fileName || 'zanahub-document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: pageSize,
          orientation: pageOrientation,
        },
        pagebreak: {
          mode: ['css', 'legacy'],
        },
      };

      await html2pdf().set(options).from(previewRef.current).save();
      setMessage('PDF downloaded successfully!');
    } catch (error) {
      console.error('Word to PDF conversion failed:', error);
      setMessage('Conversion failed. Please try a smaller document.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="wtp-page">
      <button className="wtp-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to tools
      </button>

      <header className="wtp-header">
        <div className="wtp-icon">
          <FileText size={30} />
        </div>
        <div>
          <h1>Word to PDF Converter</h1>
          <p>Turn Word documents into PDFs in a few clicks.</p>
        </div>
      </header>

      <div className="wtp-upload-area">
        <Upload size={30} />
        <h2>Upload your Word document</h2>
        <p>Choose a .docx file up to 20 MB.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFile}
          hidden
        />

        <button
          className="wtp-select"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          Choose Word document
        </button>

        {fileName && (
          <div className="wtp-file-name">
            <FileText size={17} />
            <span>{fileName}.docx</span>
          </div>
        )}
      </div>

      <div className="wtp-settings">
        <label>
          PDF page size
          <select
            value={pageSize}
            onChange={(event) => setPageSize(event.target.value)}
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </label>

        <label>
          Page orientation
          <select
            value={pageOrientation}
            onChange={(event) => setPageOrientation(event.target.value)}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
      </div>

      <div className="wtp-preview-heading">
        <h2>Document preview</h2>
        <span>{previewHtml ? 'Ready' : 'Waiting for a document'}</span>
      </div>

      <div className="wtp-preview-shell">
        {loading && !previewHtml ? (
          <div className="wtp-empty">
            <LoaderCircle className="wtp-spinner" size={30} />
            <p>Reading your document...</p>
          </div>
        ) : previewHtml ? (
          <div
            className="wtp-document"
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div className="wtp-empty">
            <FileText size={42} />
            <p>Your preview will appear here.</p>
            <span>Upload a Word document to get started.</span>
          </div>
        )}
      </div>

      {message && (
        <div className="wtp-message" role="status">
          {message}
        </div>
      )}

      <button
        className="wtp-convert"
        onClick={convertToPDF}
        disabled={!previewHtml || loading}
      >
        {loading ? (
          <>
            <LoaderCircle className="wtp-spinner" size={20} />
            Please wait...
          </>
        ) : (
          <>
            <Download size={20} />
            Convert and download PDF
          </>
        )}
      </button>

      <p className="wtp-privacy">
        <ShieldCheck size={15} />
        Files are processed in your browser by this tool, not uploaded to a
        ZanaHub server.
      </p>
    </section>
  );
}
