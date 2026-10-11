import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ArrowLeft, Upload, Download, Image as ImageIcon, LoaderCircle, X } from 'lucide-react';
import './PDFToImage.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFToImage({ onBack }) {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(0.92);
  const [pageRange, setPageRange] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }

    setFile(selected);
    setImages([]);
    setError('');
    setPageRange('');
  }

  function parsePages(input, totalPages) {
    if (!input.trim()) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const selected = new Set();

    for (const part of input.split(',')) {
      const value = part.trim();

      if (/^\d+$/.test(value)) {
        const page = Number(value);
        if (page < 1 || page > totalPages) {
          throw new Error(`Page ${page} is outside this PDF's page range.`);
        }
        selected.add(page);
      } else if (/^\d+\s*-\s*\d+$/.test(value)) {
        const [start, end] = value.split('-').map(Number);
        if (start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid page range: ${value}`);
        }
        for (let page = start; page <= end; page++) selected.add(page);
      } else {
        throw new Error('Enter pages like 1,3,5-7 or leave blank for all pages.');
      }
    }

    return [...selected].sort((a, b) => a - b);
  }

  async function convertPDF() {
    if (!file) {
      setError('Choose a PDF file first.');
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);
    setProgress('Opening PDF...');

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pages = parsePages(pageRange, pdf.numPages);
      const converted = [];

      for (let index = 0; index < pages.length; index++) {
        const pageNumber = pages[index];
        setProgress(`Converting page ${pageNumber} (${index + 1} of ${pages.length})...`);

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';

        // JPEG has no transparency, so fill the background with white.
        if (format === 'jpg') {
          context.globalCompositeOperation = 'destination-over';
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.globalCompositeOperation = 'source-over';
        }

        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            result => result ? resolve(result) : reject(new Error('Could not create image.')),
            mimeType,
            format === 'jpg' ? quality : undefined
          );
        });

        converted.push({
          page: pageNumber,
          url: URL.createObjectURL(blob),
          name: `${file.name.replace(/\.pdf$/i, '')}-page-${pageNumber}.${format}`,
          blob,
        });

        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
        setImages([...converted]);
      }

      setProgress(`Successfully converted ${converted.length} page(s)!`);
      pdf.destroy();
    } catch (err) {
      setError(err.message || 'Something went wrong while converting the PDF.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  }

  function downloadImage(image) {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function downloadAll() {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 250);
    });
  }

  function clearFile() {
    images.forEach(image => URL.revokeObjectURL(image.url));
    setImages([]);
    setFile(null);
    setPageRange('');
    setProgress('');
    setError('');
  }

  return (
    <div className="pdf-image-tool">
      <button className="pit-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to dashboard
      </button>

      <div className="pit-heading">
        <div className="pit-heading-icon"><ImageIcon size={28} /></div>
        <div>
          <h1>PDF to Image Converter</h1>
          <p>Turn PDF pages into high-quality images right in your browser.</p>
        </div>
      </div>

      <div className="pit-panel">
        {!file ? (
          <label className="pit-upload">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={chooseFile}
              hidden
            />
            <div className="pit-upload-icon"><Upload size={30} /></div>
            <h2>Upload your PDF</h2>
            <p>Click here to choose a PDF file from your device.</p>
            <span className="pit-select-button">Choose PDF File</span>
            <small>Your file is processed locally in your browser.</small>
          </label>
        ) : (
          <div className="pit-file">
            <div className="pit-file-icon"><ImageIcon size={24} /></div>
            <div className="pit-file-details">
              <strong>{file.name}</strong>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <button className="pit-icon-button" onClick={clearFile} disabled={loading} aria-label="Remove PDF">
              <X size={20} />
            </button>
          </div>
        )}

        {file && (
          <>
            <div className="pit-options">
              <div className="pit-field">
                <label htmlFor="pit-format">Image format</label>
                <select id="pit-format" value={format} onChange={e => setFormat(e.target.value)} disabled={loading}>
                  <option value="png">PNG — best for quality</option>
                  <option value="jpg">JPG — smaller file size</option>
                </select>
              </div>

              <div className="pit-field">
                <label htmlFor="pit-pages">Pages to convert</label>
                <input
                  id="pit-pages"
                  type="text"
                  value={pageRange}
                  onChange={e => setPageRange(e.target.value)}
                  placeholder="All pages (or 1,3,5-7)"
                  disabled={loading}
                />
              </div>
            </div>

            {format === 'jpg' && (
              <div className="pit-quality">
                <label htmlFor="pit-quality">JPG quality: {Math.round(quality * 100)}%</label>
                <input
                  id="pit-quality"
                  type="range"
                  min="0.4"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            )}

            <button className="pit-convert" onClick={convertPDF} disabled={loading}>
              {loading ? <><LoaderCircle className="pit-spin" size={19} /> Converting...</> : <><ImageIcon size={19} /> Convert PDF to Images</>}
            </button>
          </>
        )}

        {progress && <div className="pit-progress">{progress}</div>}
        {error && <div className="pit-error">{error}</div>}
      </div>

      {images.length > 0 && (
        <section className="pit-results">
          <div className="pit-results-heading">
            <div>
              <h2>Converted Images</h2>
              <p>{images.length} image(s) ready to download.</p>
            </div>
            <button className="pit-download-all" onClick={downloadAll}>
              <Download size={17} /> Download All
            </button>
          </div>

          <div className="pit-image-grid">
            {images.map(image => (
              <article className="pit-image-card" key={image.page}>
                <img src={image.url} alt={`PDF page ${image.page}`} />
                <div className="pit-image-info">
                  <div>
                    <strong>Page {image.page}</strong>
                    <span>{image.name}</span>
                  </div>
                  <button onClick={() => downloadImage(image)} aria-label={`Download page ${image.page}`}>
                    <Download size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
