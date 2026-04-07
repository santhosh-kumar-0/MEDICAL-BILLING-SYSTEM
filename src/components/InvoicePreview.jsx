import React from 'react';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import pharmaCareLogo from '../assets/Gemini_Generated_Image_f6jccsf6jccsf6jc.png';
import { calculateInvoiceFinancials } from '../utils/invoiceMath';

const InvoicePreview = ({ invoice }) => {
  if (!invoice) {
    return (
      <div className="invoice-preview empty">
        <div className="empty-state">
          <FaEye className="empty-icon" />
          <h3>No Invoice Selected</h3>
          <p>Select an invoice to preview.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => (
    new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  );

  const formatCurrency = (amount) => (
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  );

  const {
    subtotal,
    discountAmount,
    discountRate,
    taxAmount,
    taxRate,
    totalAmount
  } = calculateInvoiceFinancials(invoice);
  const customerName = invoice.customer?.name?.trim() || '';
  const customerMeta = [invoice.customer?.phone, invoice.customer?.address].filter(Boolean).join(' | ');
  const previewVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        staggerChildren: 0.05
      }
    }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="invoice-preview"
      variants={previewVariants}
      initial="hidden"
      animate="visible"
    >
      <div id="invoice-preview" className="invoice-content">
        <motion.div className="invoice-paper compact-receipt" variants={sectionVariants}>
          <div className="receipt-topbar">
            <div className="receipt-brand">
              <div className="receipt-logo">
                <img src={pharmaCareLogo} alt="Sri Krishna Medicals logo" />
              </div>
              <div>
                <span className="receipt-kicker">Retail Invoice</span>
                <h1>Sri Krishna Medicals</h1>
                <p>123 Medical Street, Healthcare City | +91 9710209871</p>
              </div>
            </div>

            <span className={`receipt-status ${invoice.status || 'pending'}`}>
              {invoice.status || 'pending'}
            </span>
          </div>

          <div className="receipt-meta">
            <div className="receipt-meta-card">
              <span>Bill No</span>
              <strong>{invoice.id}</strong>
            </div>
            <div className="receipt-meta-card">
              <span>Date</span>
              <strong>{formatDate(invoice.updatedAt || invoice.createdAt)}</strong>
            </div>
            <div className="receipt-meta-card">
              <span>Discount</span>
              <strong>{Math.round(discountRate * 100)}%</strong>
            </div>
          </div>

          <div className="receipt-customer">
            <div>
              <span>Bill To</span>
              {customerName ? <strong>{customerName}</strong> : null}
              {customerMeta ? <p>{customerMeta}</p> : <p>Customer details not provided</p>}
            </div>
            {invoice.doctorName ? (
              <div className="receipt-customer-side">
                <span>Doctor</span>
                <strong>{invoice.doctorName}</strong>
              </div>
            ) : null}
          </div>

          <div className="receipt-table-shell">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      <span className="receipt-item-title">{item.name}</span>
                      {(item.batchNo || item.expiryDate) ? (
                        <span className="receipt-item-meta">
                          {item.batchNo ? `Batch ${item.batchNo}` : 'Batch N/A'}
                          {item.expiryDate ? ` | Exp ${formatDate(item.expiryDate)}` : ''}
                        </span>
                      ) : null}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-summary">
            <div className="receipt-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="receipt-summary-row">
              <span>Discount</span>
              <strong>- {formatCurrency(discountAmount)}</strong>
            </div>
            <div className="receipt-summary-row">
              <span>GST ({Math.round(taxRate * 100)}%)</span>
              <strong>{formatCurrency(taxAmount)}</strong>
            </div>
            <div className="receipt-summary-row total">
              <span>Grand Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          <div className="receipt-footer">
            <p>Please keep this bill for reference.</p>
            <p>Thank you for choosing Sri Krishna Medicals.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InvoicePreview;
