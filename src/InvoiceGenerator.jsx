import { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft, Plus, Trash2, Download, Printer, FileText,
  Building2, UserRound, CalendarDays, Calculator, CheckCircle2,
} from 'lucide-react';
import './InvoiceGenerator.css';

const today = () => new Date().toISOString().slice(0, 10);
const nextMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

const money = (value) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const initialItem = () => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  price: 0,
});

export default function InvoiceGenerator({ onBack }) {
  const [business, setBusiness] = useState({
    name: '', address: '', phone: '', email: '',
  });
  const [customer, setCustomer] = useState({
    name: '', address: '', phone: '', email: '',
  });
  const [invoice, setInvoice] = useState({
    number: `INV-${Date.now().toString().slice(-7)}`,
    issueDate: today(),
    dueDate: nextMonth(),
    notes: 'Thank you for your business!',
    taxRate: 0,
    discount: 0,
  });
  const [items, setItems] = useState([initialItem()]);
  const [notice, setNotice] = useState('');

  const updateBusiness = (key, value) =>
    setBusiness((old) => ({ ...old, [key]: value }));

  const updateCustomer = (key, value) =>
    setCustomer((old) => ({ ...old, [key]: value }));

  const updateInvoice = (key, value) =>
    setInvoice((old) => ({ ...old, [key]: value }));

  const updateItem = (id, key, value) =>
    setItems((old) =>
      old.map((item) => item.id === id ? { ...item, [key]: value } : item),
    );

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.quantity) || 0) *
      Math.max(0, Number(item.price) || 0),
    0,
  );

  const discount = Math.min(
    subtotal,
    Math.max(0, Number(invoice.discount) || 0),
  );

  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * Math.max(0, Number(invoice.taxRate) || 0) / 100;
  const total = taxableAmount + tax;

  function validate() {
    if (!business.name.trim()) {
      setNotice('Please enter your business name first.');
      return false;
    }
    if (!customer.name.trim()) {
      setNotice('Please enter your customer name first.');
      return false;
    }
    if (!items.some((item) => item.description.trim())) {
      setNotice('Please add at least one invoice item.');
      return false;
    }
    setNotice('');
    return true;
  }

  function downloadPDF() {
    if (!validate()) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 17;
    const right = pageWidth - 17;
    let y = 20;

    const purple = [124, 58, 237];
    const dark = [29, 28, 48];
    const muted = [105, 105, 125];

    doc.setFillColor(...purple);
    doc.rect(0, 0, pageWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(25);
    doc.setTextColor(...dark);
    doc.text('INVOICE', left, y + 9);

    doc.setFontSize(10);
    doc.setTextColor(...purple);
    doc.text(invoice.number || 'INVOICE', right, y + 2, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`Issued: ${invoice.issueDate}`, right, y + 9, { align: 'right' });
    doc.text(`Due: ${invoice.dueDate}`, right, y + 15, { align: 'right' });

    y += 33;
    doc.setDrawColor(225, 222, 237);
    doc.line(left, y, right, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...purple);
    doc.text('FROM', left, y);
    doc.text('BILL TO', 110, y);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text(business.name || '', left, y);
    doc.text(customer.name || '', 110, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);

    const businessLines = [
      business.address, business.phone, business.email,
    ].filter(Boolean);
    const customerLines = [
      customer.address, customer.phone, customer.email,
    ].filter(Boolean);

    businessLines.forEach((line, index) =>
      doc.text(String(line), left, y + 6 + index * 5, { maxWidth: 80 }),
    );
    customerLines.forEach((line, index) =>
      doc.text(String(line), 110, y + 6 + index * 5, { maxWidth: 80 }),
    );

    y += 14 + Math.max(businessLines.length, customerLines.length) * 5 + 7;

    const ensureSpace = (needed = 18) => {
      if (y + needed > pageHeight - 22) {
        doc.addPage();
        y = 20;
      }
    };

    const drawTableHeader = () => {
      doc.setFillColor(...purple);
      doc.roundedRect(left, y, right - left, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('DESCRIPTION', left + 3, y + 6.5);
      doc.text('QTY', 116, y + 6.5, { align: 'right' });
      doc.text('UNIT PRICE', 151, y + 6.5, { align: 'right' });
      doc.text('AMOUNT', right - 3, y + 6.5, { align: 'right' });
      y += 10;
    };

    drawTableHeader();

    items.filter((item) => item.description.trim()).forEach((item) => {
      const description = doc.splitTextToSize(item.description, 83);
      const rowHeight = Math.max(10, description.length * 4.5 + 5);
      ensureSpace(rowHeight + 4);

      if (y === 20) drawTableHeader();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...dark);
      doc.text(description, left + 3, y + 6);
      doc.text(String(Number(item.quantity) || 0), 116, y + 6, { align: 'right' });
      doc.text(money(item.price), 151, y + 6, { align: 'right' });
      doc.text(
        money((Number(item.quantity) || 0) * (Number(item.price) || 0)),
        right - 3,
        y + 6,
        { align: 'right' },
      );

      y += rowHeight;
      doc.setDrawColor(232, 230, 240);
      doc.line(left, y, right, y);
    });

    y += 10;
    ensureSpace(52);

    const labelX = 128;
    const valueX = right - 3;

    const summaryLine = (label, value, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 11 : 9);
      doc.setTextColor(...(bold ? dark : muted));
      doc.text(label, labelX, y);
      doc.text(value, valueX, y, { align: 'right' });
      y += bold ? 9 : 7;
    };

    summaryLine('Subtotal', money(subtotal));
    summaryLine('Discount', `- ${money(discount)}`);
    summaryLine(`Tax (${Number(invoice.taxRate) || 0}%)`, money(tax));

    doc.setDrawColor(...purple);
    doc.line(labelX, y - 2, right, y - 2);
    y += 4;
    summaryLine('TOTAL DUE', money(total), true);

    y += 9;
    ensureSpace(25);

    if (invoice.notes.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...purple);
      doc.text('Notes', left, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      const noteLines = doc.splitTextToSize(invoice.notes, right - left);
      doc.text(noteLines, left, y);
      y += noteLines.length * 5 + 7;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('Generated with ZanaHub', left, pageHeight - 12);

    const safeName = (invoice.number || 'invoice').replace(/[^a-z0-9_-]/gi, '_');
    doc.save(`${safeName}.pdf`);
    setNotice('Your invoice PDF has been downloaded successfully.');
  }

  function printInvoice() {
    if (!validate()) return;
    downloadPDF();
    setNotice('Your invoice PDF was downloaded. Open it and select Print.');
  }

  return (
    <section className="invoice-page">
      <header className="invoice-header">
        <button className="invoice-back" onClick={onBack} type="button">
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div className="invoice-title">
          <div className="invoice-title-icon"><FileText size={24} /></div>
          <div>
            <h1>Invoice Generator</h1>
            <p>Create professional invoices for your business.</p>
          </div>
        </div>
        <div className="invoice-header-actions">
          <button className="invoice-secondary-button" type="button" onClick={printInvoice}>
            <Printer size={16} /> Print / PDF
          </button>
          <button className="invoice-primary-button" type="button" onClick={downloadPDF}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </header>

      {notice && (
        <div className="invoice-notice" role="status">
          <CheckCircle2 size={17} /> {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="invoice-layout">
        <div className="invoice-form-column">
          <section className="invoice-card">
            <h2><Building2 size={19} /> Your business</h2>
            <div className="invoice-fields">
              <label>Business name *
                <input value={business.name} onChange={(e) => updateBusiness('name', e.target.value)} placeholder="e.g. Mwangaza Supplies" />
              </label>
              <label>Address
                <input value={business.address} onChange={(e) => updateBusiness('address', e.target.value)} placeholder="Street, city" />
              </label>
              <label>Phone
                <input value={business.phone} onChange={(e) => updateBusiness('phone', e.target.value)} placeholder="+255..." />
              </label>
              <label>Email
                <input type="email" value={business.email} onChange={(e) => updateBusiness('email', e.target.value)} placeholder="business@example.com" />
              </label>
            </div>
          </section>

          <section className="invoice-card">
            <h2><UserRound size={19} /> Customer details</h2>
            <div className="invoice-fields">
              <label>Customer name *
                <input value={customer.name} onChange={(e) => updateCustomer('name', e.target.value)} placeholder="Customer or company name" />
              </label>
              <label>Address
                <input value={customer.address} onChange={(e) => updateCustomer('address', e.target.value)} placeholder="Customer address" />
              </label>
              <label>Phone
                <input value={customer.phone} onChange={(e) => updateCustomer('phone', e.target.value)} placeholder="+255..." />
              </label>
              <label>Email
                <input type="email" value={customer.email} onChange={(e) => updateCustomer('email', e.target.value)} placeholder="customer@example.com" />
              </label>
            </div>
          </section>

          <section className="invoice-card">
            <h2><CalendarDays size={19} /> Invoice information</h2>
            <div className="invoice-fields">
              <label>Invoice number
                <input value={invoice.number} onChange={(e) => updateInvoice('number', e.target.value)} />
              </label>
              <label>Issue date
                <input type="date" value={invoice.issueDate} onChange={(e) => updateInvoice('issueDate', e.target.value)} />
              </label>
              <label>Due date
                <input type="date" value={invoice.dueDate} onChange={(e) => updateInvoice('dueDate', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="invoice-card">
            <div className="invoice-items-heading">
              <h2><Calculator size={19} /> Items & services</h2>
              <button
                type="button"
                className="invoice-add-button"
                onClick={() => setItems((old) => [...old, initialItem()])}
              >
                <Plus size={15} /> Add item
              </button>
            </div>

            {items.map((item, index) => (
              <div className="invoice-item-editor" key={item.id}>
                <label className="invoice-item-description">
                  Description
                  <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder={`Item ${index + 1}`} />
                </label>
                <label>
                  Quantity
                  <input type="number" min="0" step="any" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                </label>
                <label>
                  Unit price (TZS)
                  <input type="number" min="0" step="any" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} />
                </label>
                <button
                  type="button"
                  className="invoice-remove-button"
                  disabled={items.length === 1}
                  onClick={() => setItems((old) => old.filter((row) => row.id !== item.id))}
                  aria-label={`Remove item ${index + 1}`}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </section>

          <section className="invoice-card">
            <h2>Discount, tax & notes</h2>
            <div className="invoice-fields">
              <label>Discount (TZS)
                <input type="number" min="0" value={invoice.discount} onChange={(e) => updateInvoice('discount', e.target.value)} />
              </label>
              <label>Tax rate (%)
                <input type="number" min="0" max="100" step="any" value={invoice.taxRate} onChange={(e) => updateInvoice('taxRate', e.target.value)} />
              </label>
              <label className="invoice-full-field">Notes / payment instructions
                <textarea rows="3" value={invoice.notes} onChange={(e) => updateInvoice('notes', e.target.value)} placeholder="Payment details or a thank-you message" />
              </label>
            </div>
            <p className="invoice-tax-hint">
              Tax is optional. Enter the applicable rate for your transaction; this tool does not determine your legal tax obligations.
            </p>
          </section>
        </div>

        <aside className="invoice-preview-column">
          <div className="invoice-preview-card">
            <div className="invoice-preview-top">
              <span className="invoice-preview-label">LIVE SUMMARY</span>
              <span className="invoice-preview-number">{invoice.number || 'Invoice'}</span>
            </div>
            <h2>{business.name || 'Your Business Name'}</h2>
            <p className="invoice-preview-customer">Bill to: <strong>{customer.name || 'Customer name'}</strong></p>
            <div className="invoice-preview-dates">
              <div><span>Issue date</span><strong>{invoice.issueDate || '—'}</strong></div>
              <div><span>Due date</span><strong>{invoice.dueDate || '—'}</strong></div>
            </div>
            <div className="invoice-preview-items">
              {items.filter((item) => item.description.trim()).length === 0 ? (
                <p className="invoice-empty-preview">Your invoice items will appear here.</p>
              ) : items.filter((item) => item.description.trim()).map((item) => (
                <div className="invoice-preview-item" key={item.id}>
                  <span>{item.description}<small>{Number(item.quantity) || 0} × {money(item.price)}</small></span>
                  <strong>{money((Number(item.quantity) || 0) * (Number(item.price) || 0))}</strong>
                </div>
              ))}
            </div>
            <div className="invoice-preview-totals">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div><span>Discount</span><strong>− {money(discount)}</strong></div>
              <div><span>Tax ({Number(invoice.taxRate) || 0}%)</span><strong>{money(tax)}</strong></div>
              <div className="invoice-grand-total"><span>Total due</span><strong>{money(total)}</strong></div>
            </div>
            <button className="invoice-primary-button invoice-preview-download" type="button" onClick={downloadPDF}>
              <Download size={17} /> Download invoice PDF
            </button>
            <p className="invoice-preview-footnote">Your PDF is generated in your browser.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
