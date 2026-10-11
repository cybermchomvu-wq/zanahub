import { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ExcelToPDF.css';

export default function ExcelToPDF({ onBack }) {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    setError('');
    setSheets([]);
    setSelectedSheet('');
    setFile(null);

    if (!selectedFile) return;

    const validExtension = /\.(xlsx|xls|csv)$/i.test(selectedFile.name);

    if (!validExtension) {
      setError('Please select an Excel (.xlsx, .xls) or CSV file.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Please choose a file smaller than 20 MB.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });

        if (!workbook.SheetNames.length) {
          throw new Error('No worksheets were found in this file.');
        }

        setSheets(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0]);
      } catch {
        setFile(null);
        setError('Could not read this file. Please check that it is a valid spreadsheet.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setFile(null);
      setError('The file could not be opened. Please try again.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  }

  async function convertToPDF() {
    if (!file || !selectedSheet) {
      setError('Please upload a spreadsheet first.');
      return;
    }

    setError('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[selectedSheet];

      if (!worksheet || !worksheet['!ref']) {
        setError('This worksheet is empty.');
        return;
      }

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false,
      });

      if (!rows.length) {
        setError('This worksheet has no data to convert.');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFontSize(15);
      pdf.text(file.name.replace(/\.[^.]+$/, '').slice(0, 100), 14, 15);

      pdf.setFontSize(9);
      pdf.text(`Worksheet: ${selectedSheet}`, 14, 22);

      autoTable(pdf, {
        head: [rows[0].map((cell) => String(cell ?? ''))],
        body: rows.slice(1).map((row) =>
          row.map((cell) => String(cell ?? ''))
        ),
        startY: 28,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fontStyle: 'bold',
        },
        margin: {
          top: 12,
          right: 10,
          bottom: 12,
          left: 10,
        },
        horizontalPageBreak: true,
        showHead: 'everyPage',
      });

      const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .slice(0, 100) || 'spreadsheet';

      pdf.save(`${safeName}.pdf`);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please try another spreadsheet.');
    }
  }

  return (
    <div className="excel-pdf-page">
      <button className="excel-pdf-back" onClick={onBack}>
        ← Back to Tools
      </button>

      <div className="excel-pdf-card">
        <div className="excel-pdf-icon">📊</div>
        <h2>Excel to PDF</h2>
        <p className="excel-pdf-description">
          Convert Excel spreadsheets and CSV files into downloadable PDF documents.
        </p>

        <label className="excel-pdf-upload">
          <span className="excel-pdf-upload-icon">📁</span>
          <strong>{file ? file.name : 'Choose a spreadsheet'}</strong>
          <span>Excel (.xlsx, .xls) or CSV · Maximum 20 MB</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
        </label>

        {loading && <p className="excel-pdf-status">Reading spreadsheet...</p>}

        {sheets.length > 0 && (
          <div className="excel-pdf-sheet">
            <label htmlFor="excel-sheet-select">Choose worksheet</label>
            <select
              id="excel-sheet-select"
              value={selectedSheet}
              onChange={(event) => setSelectedSheet(event.target.value)}
            >
              {sheets.map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
            <p>{sheets.length} worksheet(s) found.</p>
          </div>
        )}

        {error && <p className="excel-pdf-error">{error}</p>}

        <button
          className="excel-pdf-convert"
          onClick={convertToPDF}
          disabled={!file || loading}
        >
          Convert & Download PDF ↓
        </button>

        <p className="excel-pdf-privacy">
          🔒 Your spreadsheet is processed locally in your browser.
        </p>
      </div>
    </div>
  );
}
