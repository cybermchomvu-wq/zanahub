import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  LoaderCircle,
} from 'lucide-react';
import './ImageToPDF.css';

export default function ImageToPDF({ onBack }) {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('fit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function addImages(event) {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) =>
      ['image/jpeg', 'image/png'].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      setMessage('Only JPG and PNG images are supported.');
    } else {
      setMessage('');
    }

    const newImages = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...newImages]);
    event.target.value = '';
  }

  function removeImage(id) {
    setImages((previous) => {
      const target = previous.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return previous.filter((image) => image.id !== id);
    });
  }

  function moveImage(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((previous) => {
      const updated = [...previous];
      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];
      return updated;
    });
  }

  async function createPDF() {
    if (!images.length || loading) return;

    setLoading(true);
    setMessage('');

    try {
      const pdf = await PDFDocument.create();

      for (const image of images) {
        const bytes = await image.file.arrayBuffer();
        const embeddedImage =
          image.file.type === 'image/png'
            ? await pdf.embedPng(bytes)
            : await pdf.embedJpg(bytes);

        let width = embeddedImage.width;
        let height = embeddedImage.height;

        if (pageSize === 'a4') {
          const portrait = height >= width;
          const pageWidth = portrait ? 595.28 : 841.89;
          const pageHeight = portrait ? 841.89 : 595.28;
          const margin = 28;

          const scale = Math.min(
            (pageWidth - margin * 2) / width,
            (pageHeight - margin * 2) / height
          );

          width *= scale;
          height *= scale;

          const page = pdf.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImage, {
            x: (pageWidth - width) / 2,
            y: (pageHeight - height) / 2,
            width,
            height,
          });
        } else {
          const page = pdf.addPage([width, height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zanahub-images.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage(`Success! Your PDF contains ${images.length} page(s).`);
    } catch (error) {
      console.error('PDF creation failed:', error);
      setMessage('Could not create the PDF. Please try different images.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="itp-page">
      <button className="itp-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to tools
      </button>

      <header className="itp-header">
        <div className="itp-icon">
          <FileText size={30} />
        </div>
        <div>
          <h1>Image to PDF Converter</h1>
          <p>Combine your pictures into one downloadable PDF.</p>
        </div>
      </header>

      <div className="itp-settings">
        <label htmlFor="itp-upload" className="itp-upload">
          <Upload size={25} />
          <strong>Choose images</strong>
          <span>Select multiple JPG or PNG files from your device.</span>
          <input
            id="itp-upload"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={addImages}
          />
        </label>

        <div className="itp-options">
          <label htmlFor="itp-page-size">PDF page size</label>
          <select
            id="itp-page-size"
            value={pageSize}
            onChange={(event) => setPageSize(event.target.value)}
          >
            <option value="fit">Fit page to each image</option>
            <option value="a4">A4 paper</option>
          </select>
          <p>
            {pageSize === 'fit'
              ? 'Each PDF page matches its image dimensions.'
              : 'Images are centered and fitted onto A4 pages.'}
          </p>
        </div>
      </div>

      <div className="itp-list-heading">
        <div>
          <h2>Your images</h2>
          <span>{images.length} image(s) selected</span>
        </div>
        {images.length > 0 && (
          <button
            className="itp-clear"
            onClick={() => {
              images.forEach((image) => URL.revokeObjectURL(image.preview));
              setImages([]);
              setMessage('');
            }}
          >
            <Trash2 size={16} /> Clear all
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="itp-empty">
          <ImageIcon size={42} />
          <p>No images selected yet.</p>
          <span>Choose images above to get started.</span>
        </div>
      ) : (
        <div className="itp-grid">
          {images.map((image, index) => (
            <article className="itp-card" key={image.id}>
              <img src={image.preview} alt={image.file.name} />
              <div className="itp-card-info">
                <span className="itp-number">Page {index + 1}</span>
                <p title={image.file.name}>{image.file.name}</p>
                <small>{(image.file.size / 1024).toFixed(0)} KB</small>
                <div className="itp-card-actions">
                  <button
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label="Move image up"
                    title="Move earlier"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move image down"
                    title="Move later"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className="itp-remove"
                    onClick={() => removeImage(image.id)}
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {message && (
        <div className="itp-message" role="status">
          {message}
        </div>
      )}

      <button
        className="itp-create"
        onClick={createPDF}
        disabled={!images.length || loading}
      >
        {loading ? (
          <>
            <LoaderCircle className="itp-spinner" size={20} />
            Creating PDF...
          </>
        ) : (
          <>
            <Download size={20} />
            Convert {images.length} image(s) to PDF
          </>
        )}
      </button>

      <p className="itp-privacy">
        Your images are processed in your browser and are not uploaded to a
        server by this tool.
      </p>
    </section>
  );
}
