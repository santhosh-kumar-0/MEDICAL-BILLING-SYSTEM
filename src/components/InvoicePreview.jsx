import React from 'react';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import { calculateInvoiceFinancials } from '../utils/invoiceMath';
import {
  calculateLineTotal,
  formatUnitLabel,
  normalizePacking
} from '../utils/medicinePricing';

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  );

  const {
    subtotal,
    discountAmount,
    discountRate,
    taxableSubtotal,
    taxAmount,
    taxRate,
    totalAmount
  } = calculateInvoiceFinancials(invoice);
  const customer = invoice.customer || {};
  const customerName = customer.name?.trim() || 'Walk-in Customer';
  const customerContact = [customer.phone, customer.address].filter(Boolean);
  const previewVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
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
        <motion.div className="pharmacy-bill-paper clean-bill-paper" variants={sectionVariants}>
          <div className="invoice-brand-strip clean-bill-header">
            <div className="invoice-branding-block">
              <span className="invoice-title-label">Retail Bill</span>
              <div className="shop-name">
                <h1>Sri Krishna Medicals</h1>
              </div>
              <div className="shop-details clean-bill-details">
                <p>123 Medical Street, Healthcare City</p>
                <p>Phone: +91 9710209871</p>
              </div>
            </div>
          </div>

          <div className="invoice-meta-strip">
            <div className="invoice-meta-grid invoice-meta-grid-compact">
              <div className="invoice-meta-card">
                <span>Bill No</span>
                <strong>{invoice.id}</strong>
              </div>
              <div className="invoice-meta-card">
                <span>Bill Date</span>
                <strong>{formatDate(invoice.updatedAt || invoice.createdAt)}</strong>
              </div>
              <div className="invoice-meta-card">
                <span>Status</span>
                <strong className={`invoice-status-pill ${invoice.status || 'pending'}`}>
                  {invoice.status || 'pending'}
                </strong>
              </div>
              <div className="invoice-meta-card">
                <span>Discount</span>
                <strong>{Math.round(discountRate * 100)}%</strong>
              </div>
            </div>
          </div>

          <div className="invoice-party-grid invoice-bill-parties">
            <div className="invoice-party-card">
              <span className="party-label">Bill To</span>
              <h3>{customerName}</h3>
              {customerContact.length > 0 ? (
                customerContact.map((detail) => <p key={detail}>{detail}</p>)
              ) : (
                <p>Customer phone and address not entered</p>
              )}
            </div>

            <div className="invoice-party-card">
              <span className="party-label">Doctor</span>
              <h3>{invoice.doctorName || 'Not Provided'}</h3>
              <p>Generated on {formatDate(invoice.updatedAt || invoice.createdAt)}</p>
            </div>
          </div>

          <div className="invoice-products-table">
            <table className="products-table invoice-line-table">
              <thead>
                <tr>
                  <th className="sl-no">#</th>
                  <th className="product-name">Medicine</th>
                  <th className="batch-no">Batch / Pack</th>
                  <th className="qty">Qty</th>
                  <th className="unit-col">Unit</th>
                  <th className="rate">Rate</th>
                  <th className="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={item.id || `${item.name}-${index}`}>
                    <td>{index + 1}</td>
                    <td className="product-name">
                      <span className="product-title">{item.name}</span>
                      <span className="product-subtitle">
                        Exp: {item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}
                      </span>
                    </td>
                    <td className="batch-no">
                      <span className="product-title">{item.batchNo || 'N/A'}</span>
                      <span className="product-subtitle">
                        Pack: {normalizePacking(item.packing)}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td className="unit-col">{formatUnitLabel(item.billingUnit || item.priceUnit, { capitalize: true })}</td>
                    <td>{formatCurrency(item.unitPrice ?? item.price)}</td>
                    <td>{formatCurrency(calculateLineTotal(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary-panel">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount ({Math.round(discountRate * 100)}%)</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Taxable Amount</span>
              <span>{formatCurrency(taxableSubtotal)}</span>
            </div>
            <div className="summary-row">
              <span>GST ({Math.round(taxRate * 100)}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="modern-invoice-footer clean-bill-footer">
            <div className="footer-info">
              <p>Please keep this bill for future reference.</p>
              <p>Thank you for choosing Sri Krishna Medicals.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InvoicePreview;
