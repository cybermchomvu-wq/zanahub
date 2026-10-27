import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft, Plus, Trash2, Download, Printer,
  ReceiptText, CheckCircle2,
} from 'lucide-react';
import './ReceiptGenerator.css';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const money = (value) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const newItem = () => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  price: 0,
});

export default function ReceiptGenerator({ onBack }) {
  const [business, setBusiness] = useState(() => {
    try {
      const saved = localStorage.getItem('zanahub_receipt_business');
      return saved
        ? { name: '', address: '', phone: '', ...JSON.parse(saved) }
        : { name: '', address: '', phone: '' };
    } catch {
      return { name: '', address: '', phone: '' };
    }
  });
  const [businessSaved, setBusinessSaved] = useState(() => {
    try {
      return Boolean(localStorage.getItem('zanahub_receipt_business'));
    } catch {
      return false;
    }
  });
  const [customer, setCustomer] = useState({
    name: '', phone: '',
  });
  const [receipt, setReceipt] = useState({
    number: `REC-${Date.now().toString().slice(-7)}`,
    date: today(),
    paymentMethod: 'Cash',
    amountPaid: '',
    discount: 0,
    notes: 'Thank you for your purchase!',
  });
  const [items, setItems] = useState([newItem()]);
  const [notice, setNotice] = useState('');

  const updateBusiness = (key, value) => {
    setBusiness((old) => ({ ...old, [key]: value }));
    setBusinessSaved(false);
  };

  function saveBusinessDetails() {
    try {
      localStorage.setItem(
        'zanahub_receipt_business',
        JSON.stringify(business),
      );
      setBusinessSaved(true);
      setNotice('Business details saved on this device.');
    } catch {
      setNotice('Could not save details. Check your browser storage settings.');
    }
  }

  function clearBusinessDetails() {
    try {
      localStorage.removeItem('zanahub_receipt_business');
      setBusiness({ name: '', address: '', phone: '' });
      setBusinessSaved(false);
      setNotice('Saved business details cleared.');
    } catch {
      setNotice('Could not clear saved details.');
    }
  }

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const updateCustomer = (key, value) =>
    setCustomer((old) => ({ ...old, [key]: value }));

  const updateReceipt = (key, value) =>
    setReceipt((old) => ({ ...old, [key]: value }));

  const updateItem = (id, key, value) =>
    setItems((old) =>
      old.map((item) => item.id === id ? { ...item, [key]: value } : item),
    );

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Math.max(0, Number(item.quantity) || 0) *
      Math.max(0, Number(item.price) || 0),
    0,
  );

  const discount = Math.min(
    subtotal,
    Math.max(0, Number(receipt.discount) || 0),
  );

  const total = Math.max(0, subtotal - discount);
  const amountPaid = Math.max(0, Number(receipt.amountPaid) || 0);
  const balance = Math.max(0, total - amountPaid);
  const change = Math.max(0, amountPaid - total);

  function validate() {
    if (!business.name.trim()) {
      setNotice('Please enter your business name.');
      return false;
    }

    if (!items.some((item) => item.description.trim())) {
      setNotice('Please add at least one product or service.');
      return false;
    }

    if (Number(receipt.amountPaid) < 0 || Number(receipt.discount) < 0) {
      setNotice('Amounts cannot be negative.');
      return false;
    }

    setNotice('');
    return true;
  }

  function createPDF() {
    if (!validate()) return null;

    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const left = 16;
    const right = width - 16;
    const purple = [111, 64, 220];
    const dark = [35, 35, 55];
    const muted = [105, 105, 125];
    let y = 20;

    doc.setFillColor(...purple);
    doc.rect(0, 0, width, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(...dark);
    doc.text('RECEIPT', left, y + 5);

    doc.setFontSize(10);
    doc.setTextColor(...purple);
    doc.text(receipt.number || 'RECEIPT', right, y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...muted);
    doc.setFontSize(9);
    doc.text(`Date: ${receipt.date}`, right, y + 7, { align: 'right' });

    y += 23;
    doc.setDrawColor(225, 220, 240);
    doc.line(left, y, right, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...purple);
    doc.setFontSize(10);
    doc.text('BUSINESS', left, y);
    doc.text('CUSTOMER', 110, y);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.text(business.name || '', left, y);
    doc.text(customer.name || 'Walk-in customer', 110, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);

    const businessLines = [business.address, business.phone].filter(Boolean);
    const customerLines = [customer.phone].filter(Boolean);

    businessLines.forEach((line, i) =>
      doc.text(String(line), left, y + 6 + i * 5, { maxWidth: 80 }),
    );

    customerLines.forEach((line, i) =>
      doc.text(String(line), 110, y + 6 + i * 5, { maxWidth: 80 }),
    );

    y += 17 + Math.max(businessLines.length, customerLines.length) * 5;

    const drawHeader = () => {
      doc.setFillColor(...purple);
      doc.roundedRect(left, y, right - left, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ITEM', left + 3, y + 6.5);
      doc.text('QTY', 113, y + 6.5, { align: 'right' });
      doc.text('PRICE', 151, y + 6.5, { align: 'right' });
      doc.text('AMOUNT', right - 3, y + 6.5, { align: 'right' });
      y += 10;
    };

    const ensureSpace = (needed) => {
      if (y + needed > height - 20) {
        doc.addPage();
        y = 20;
      }
    };

    drawHeader();

    items.filter((item) => item.description.trim()).forEach((item) => {
      const lines = doc.splitTextToSize(item.description, 78);
      const rowHeight = Math.max(10, lines.length * 4.5 + 5);
      ensureSpace(rowHeight + 4);

      if (y === 20) drawHeader();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...dark);
      doc.text(lines, left + 3, y + 6);
      doc.text(String(Number(item.quantity) || 0), 113, y + 6, { align: 'right' });
      doc.text(money(item.price), 151, y + 6, { align: 'right' });
      doc.text(
        money((Number(item.quantity) || 0) * (Number(item.price) || 0)),
        right - 3,
        y + 6,
        { align: 'right' },
      );

      y += rowHeight;
      doc.setDrawColor(230, 228, 240);
      doc.line(left, y, right, y);
    });

    y += 8;
    ensureSpace(75);

    const labelX = 120;
    const valueX = right - 3;

    const summaryLine = (label, value, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 12 : 9);
      doc.setTextColor(...(bold ? dark : muted));
      doc.text(label, labelX, y);
      doc.text(value, valueX, y, { align: 'right' });
      y += bold ? 10 : 7;
    };

    summaryLine('Subtotal', money(subtotal));
    summaryLine('Discount', `- ${money(discount)}`);

    doc.setDrawColor(...purple);
    doc.line(labelX, y - 2, right, y - 2);
    y += 4;
    summaryLine('TOTAL', money(total), true);
    summaryLine('Payment method', receipt.paymentMethod);
    summaryLine('Amount paid', money(amountPaid));

    if (balance > 0) summaryLine('BALANCE DUE', money(balance), true);
    if (change > 0) summaryLine('CHANGE', money(change), true);

    y += 5;
    if (receipt.notes.trim()) {
      ensureSpace(15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text(doc.splitTextToSize(receipt.notes, right - left), left, y);
    }

    return doc;
  }

  function downloadPDF() {
    const doc = createPDF();
    if (doc) doc.save(`${receipt.number || 'receipt'}.pdf`);
  }

  function printReceipt() {
    const doc = createPDF();
    if (!doc) return;

    const url = URL.createObjectURL(
      doc.output('blob'),
    );
    const popup = window.open(url, '_blank');

    if (!popup) {
      URL.revokeObjectURL(url);
      setNotice('Your browser blocked the print window. Please allow pop-ups or download the PDF.');
      return;
    }

    popup.addEventListener('load', () => {
      popup.focus();
      popup.print();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, { once: true });
  }

  return (
    <div className="receipt-tool">
      <header className="receipt-toolbar">
        <button className="receipt-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <h1><ReceiptText size={25} /> Receipt Generator</h1>
          <p>Create professional receipts for your business</p>
        </div>
        <div className="receipt-actions">
          <button className="receipt-secondary" onClick={printReceipt}>
            <Printer size={17} /> Print
          </button>
          <button className="receipt-primary" onClick={downloadPDF}>
            <Download size={17} /> Download PDF
          </button>
        </div>
      </header>

      {notice && (
        <div className="receipt-notice" role="alert">
          {notice}
        </div>
      )}

      <div className="receipt-layout">
        <section className="receipt-form">
          <div className="receipt-card">
            <div className="receipt-section-heading">
              <h2>Business details</h2>
              <span className={`receipt-saved-status ${businessSaved ? 'is-saved' : ''}`}>
                {businessSaved ? 'Saved on this device' : 'Not saved yet'}
              </span>
            </div>
            <div className="receipt-fields">
              <label>
                Business name *
                <input value={business.name} onChange={(e) => updateBusiness('name', e.target.value)} placeholder="Your business name" />
              </label>
              <label>
                Address
                <input value={business.address} onChange={(e) => updateBusiness('address', e.target.value)} placeholder="Business address" />
              </label>
              <label>
                Phone
                <input value={business.phone} onChange={(e) => updateBusiness('phone', e.target.value)} placeholder="+255..." />
              </label>
            </div>
            <div className="receipt-save-actions">
              <button type="button" className="receipt-primary" onClick={saveBusinessDetails}>
                Save business details
              </button>
              <button type="button" className="receipt-secondary" onClick={clearBusinessDetails}>
                Clear saved details
              </button>
            </div>
          </div>

          <div className="receipt-card">
            <h2>Receipt details</h2>
            <div className="receipt-fields">
              <label>
                Receipt number
                <input value={receipt.number} onChange={(e) => updateReceipt('number', e.target.value)} />
              </label>
              <label>
                Date
                <input type="date" value={receipt.date} onChange={(e) => updateReceipt('date', e.target.value)} />
              </label>
              <label>
                Customer name
                <input value={customer.name} onChange={(e) => updateCustomer('name', e.target.value)} placeholder="Walk-in customer" />
              </label>
              <label>
                Customer phone
                <input value={customer.phone} onChange={(e) => updateCustomer('phone', e.target.value)} placeholder="+255..." />
              </label>
              <label>
                Payment method
                <select value={receipt.paymentMethod} onChange={(e) => updateReceipt('paymentMethod', e.target.value)}>
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Amount paid (TZS)
                <input type="number" min="0" value={receipt.amountPaid} onChange={(e) => updateReceipt('amountPaid', e.target.value)} placeholder="Enter amount received" />
              </label>
              <label>
                Discount (TZS)
                <input type="number" min="0" max={subtotal} value={receipt.discount} onChange={(e) => updateReceipt('discount', e.target.value)} />
              </label>
            </div>
          </div>

          <div className="receipt-card">
            <div className="receipt-section-heading">
              <h2>Products and services</h2>
              <button className="receipt-add" onClick={() => setItems((old) => [...old, newItem()])}>
                <Plus size={16} /> Add item
              </button>
            </div>

            {items.map((item, index) => (
              <div className="receipt-item" key={item.id}>
                <label className="receipt-description">
                  Item {index + 1}
                  <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Product or service" />
                </label>
                <label>
                  Qty
                  <input type="number" min="0" step="any" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                </label>
                <label>
                  Unit price
                  <input type="number" min="0" step="any" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} />
                </label>
                <button className="receipt-delete" title="Remove item" disabled={items.length === 1} onClick={() => setItems((old) => old.filter((x) => x.id !== item.id))}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <div className="receipt-card">
            <h2>Thank-you message</h2>
            <textarea rows="3" value={receipt.notes} onChange={(e) => updateReceipt('notes', e.target.value)} placeholder="Thank you for your purchase!" />
          </div>
        </section>

        <aside className="receipt-preview">
          <div className="receipt-paper">
            <div className="receipt-paper-top" />
            <div className="receipt-paper-heading">
              <ReceiptText size={28} />
              <h2>RECEIPT</h2>
              <span>{receipt.number || 'Receipt number'}</span>
              <small>{receipt.date}</small>
            </div>

            <div className="receipt-paper-parties">
              <div>
                <small>FROM</small>
                <strong>{business.name || 'Your business name'}</strong>
                {business.address && <span>{business.address}</span>}
                {business.phone && <span>{business.phone}</span>}
              </div>
              <div>
                <small>CUSTOMER</small>
                <strong>{customer.name || 'Walk-in customer'}</strong>
                {customer.phone && <span>{customer.phone}</span>}
              </div>
            </div>

            <div className="receipt-paper-items">
              <div className="receipt-paper-table-head">
                <span>Item</span><span>Qty</span><span>Amount</span>
              </div>
              {items.filter((item) => item.description.trim()).map((item) => (
                <div className="receipt-paper-row" key={item.id}>
                  <span>{item.description}<small>{money(item.price)} each</small></span>
                  <span>{Number(item.quantity) || 0}</span>
                  <strong>{money((Number(item.quantity) || 0) * (Number(item.price) || 0))}</strong>
                </div>
              ))}
              {!items.some((item) => item.description.trim()) && (
                <p className="receipt-empty">Your items will appear here.</p>
              )}
            </div>

            <div className="receipt-paper-totals">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div><span>Discount</span><strong>- {money(discount)}</strong></div>
              <div className="receipt-paper-total"><span>TOTAL</span><strong>{money(total)}</strong></div>
              <div><span>Payment method</span><strong>{receipt.paymentMethod}</strong></div>
              <div><span>Amount paid</span><strong>{money(amountPaid)}</strong></div>
              {balance > 0 && <div className="receipt-balance"><span>Balance due</span><strong>{money(balance)}</strong></div>}
              {change > 0 && <div className="receipt-change"><span>Change</span><strong>{money(change)}</strong></div>}
            </div>

            <div className="receipt-paper-thanks">
              <CheckCircle2 size={21} />
              <p>{receipt.notes || 'Thank you for your purchase!'}</p>
            </div>
            <div className="receipt-paper-footer">Thank you for supporting our business.</div>
          </div>
          <p className="receipt-preview-hint">Live preview · Amounts in Tanzanian shillings (TZS)</p>
        </aside>
      </div>
    </div>
  );
}
