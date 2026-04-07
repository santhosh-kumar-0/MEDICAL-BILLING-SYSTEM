import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaFileInvoice, FaReceipt } from 'react-icons/fa';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceFinancials } from '../utils/invoiceMath';
import { getInvoices, initializeDefaultData } from '../utils/localStorageManager';

const sortInvoicesByRecent = (invoices) => (
  [...invoices].sort((firstInvoice, secondInvoice) => (
    new Date(secondInvoice.updatedAt || secondInvoice.createdAt) -
    new Date(firstInvoice.updatedAt || firstInvoice.createdAt)
  ))
);

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        await initializeDefaultData();
        const storedInvoices = sortInvoicesByRecent(await getInvoices());
        setInvoices(storedInvoices);
        setSelectedInvoice(storedInvoices[0] || null);
      } catch (error) {
        console.error('Error loading invoices:', error);
      }
    };

    loadInvoices();
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + calculateInvoiceFinancials(invoice).totalAmount,
    0
  );

  return (
    <motion.div
      className="invoice-history-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Invoice History</h1>
          <p>All saved bills are listed here. Use Preview to view any invoice.</p>
        </div>

        <div className="header-actions">
          <motion.button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/billing')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaFileInvoice className="button-glyph" />
            Create Bill
          </motion.button>
        </div>
      </div>

      <div className="stats-grid invoice-history-summary">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaReceipt />
          </div>
          <div className="stat-content">
            <h3>{invoices.length}</h3>
            <p>Saved Bills</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available">
            <FaFileInvoice />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="invoice-history-layout">
        <section className="billing-history-panel invoice-history-list-panel">
          <div className="billing-history-head">
            <div>
              <h2>Saved Invoices</h2>
              <p>Select any saved bill and preview it on the right side.</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="empty-items billing-history-empty">
              <FaReceipt className="empty-icon" />
              <p>No saved bills yet.</p>
            </div>
          ) : (
            <div className="billing-history-list">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`billing-history-item ${selectedInvoice?.id === invoice.id ? 'active' : ''}`}
                >
                  <div className="billing-history-info">
                    <div className="billing-history-title">{invoice.id}</div>
                    <div className="billing-history-meta">
                      {invoice.customer?.name || 'Customer not entered'}
                    </div>
                    <div className="billing-history-meta">
                      {formatDate(invoice.updatedAt || invoice.createdAt)}
                    </div>
                  </div>

                  <div className="billing-history-amount">
                    <strong>{formatCurrency(calculateInvoiceFinancials(invoice).totalAmount)}</strong>
                    <span className={`status ${invoice.status || 'pending'}`}>
                      {invoice.status || 'pending'}
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    className="btn-secondary billing-history-preview"
                    onClick={() => setSelectedInvoice(invoice)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaEye />
                    Preview
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bill-preview-section invoice-history-preview-panel">
          <div className="invoice-preview-header">
            <div>
              <h3>Invoice Preview</h3>
              <p className="bill-preview-caption">
                {selectedInvoice
                  ? `Previewing invoice ${selectedInvoice.id}.`
                  : 'Choose a saved invoice to preview it here.'}
              </p>
            </div>
          </div>

          <div className="invoice-preview-container billing-preview-container">
            {selectedInvoice ? (
              <InvoicePreview invoice={selectedInvoice} />
            ) : (
              <div className="bill-preview-placeholder">
                <FaFileInvoice className="empty-icon" />
                <h4>No Invoice Selected</h4>
                <p>Use the Preview button from the saved invoice list to open a bill here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default InvoiceHistory;
