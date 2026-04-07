import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaDownload,
  FaFileInvoice,
  FaPills,
  FaPlus,
  FaPrint,
  FaReceipt,
  FaSearch,
  FaSyncAlt,
  FaTrash
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceFinancials } from '../utils/invoiceMath';
import {
  getMedicines,
  initializeDefaultData,
  saveInvoiceWithStock
} from '../utils/localStorageManager';

const GST_OPTIONS = [0, 5, 12, 18];
const DISCOUNT_OPTIONS = [0, 5, 10, 15];
const EMPTY_BILLING_DETAILS = {
  customerName: '',
  phone: '',
  address: '',
  doctorName: ''
};

const CreateInvoice = () => {
  const [medicines, setMedicines] = useState([]);
  const [billingDetails, setBillingDetails] = useState(EMPTY_BILLING_DETAILS);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [invoiceStatus, setInvoiceStatus] = useState('pending');
  const [gstRate, setGstRate] = useState(12);
  const [discountRate, setDiscountRate] = useState(10);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [savedInvoiceItems, setSavedInvoiceItems] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const deferredMedicineSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        await initializeDefaultData();
        const loadedMedicines = await getMedicines();
        setMedicines(loadedMedicines);
      } catch (error) {
        console.error('Error loading billing data:', error);
      }
    };

    loadBillingData();
  }, []);

  const refreshBillingData = async () => {
    const loadedMedicines = await getMedicines();
    setMedicines(loadedMedicines);
  };

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

  const formatPriceUnit = (priceUnit) => (priceUnit === 'tablet' ? 'Tablet' : 'Strip');

  const getReferenceInvoiceQuantity = (medicineId) => (
    savedInvoiceItems.reduce((totalQuantity, item) => (
      item.id === medicineId ? totalQuantity + item.quantity : totalQuantity
    ), 0)
  );

  const getMaximumBillQuantity = (medicineId) => {
    const medicine = medicines.find((item) => item.id === medicineId);

    if (!medicine) {
      return 0;
    }

    return medicine.stock + getReferenceInvoiceQuantity(medicineId);
  };

  const touchDraft = (message) => {
    if (generatedInvoice) {
      setGeneratedInvoice(null);
    }

    setStatusMessage(message || '');
  };

  const filteredMedicines = useMemo(() => {
    const normalizedSearch = deferredMedicineSearch.trim().toLowerCase();

    return [...medicines]
      .filter((medicine) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          medicine.name.toLowerCase().includes(normalizedSearch) ||
          medicine.description?.toLowerCase().includes(normalizedSearch) ||
          medicine.category?.toLowerCase().includes(normalizedSearch) ||
          medicine.manufacturer?.toLowerCase().includes(normalizedSearch) ||
          medicine.batchNumber?.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((firstMedicine, secondMedicine) => firstMedicine.name.localeCompare(secondMedicine.name));
  }, [medicines, deferredMedicineSearch]);

  const draftFinancials = useMemo(() => (
    calculateInvoiceFinancials(
      {
        items: invoiceItems,
        discountRate: discountRate / 100,
        taxRate: gstRate / 100,
        shipping: 0
      },
      {
        defaultDiscountRate: discountRate / 100,
        defaultTaxRate: gstRate / 100
      }
    )
  ), [discountRate, gstRate, invoiceItems]);

  const {
    subtotal,
    discountAmount,
    taxableSubtotal,
    taxAmount,
    totalAmount
  } = draftFinancials;

  const handleBillingDetailChange = (event) => {
    const { name, value } = event.target;
    touchDraft('Billing details updated. Generate the bill again to refresh the invoice preview.');
    setBillingDetails((previousDetails) => ({
      ...previousDetails,
      [name]: value
    }));
  };

  const buildInvoiceCustomer = () => {
    const customer = {
      name: billingDetails.customerName.trim(),
      phone: billingDetails.phone.trim(),
      address: billingDetails.address.trim()
    };

    return Object.values(customer).some(Boolean) ? customer : null;
  };

  const updateQuantityInput = (medicineId, value, maxStock) => {
    if (value === '') {
      setQuantities((previousQuantities) => ({
        ...previousQuantities,
        [medicineId]: ''
      }));
      return;
    }

    const cleanedValue = value.replace(/[^\d]/g, '');

    if (!cleanedValue) {
      return;
    }

    const nextQuantity = Math.min(Number(cleanedValue), maxStock);
    setQuantities((previousQuantities) => ({
      ...previousQuantities,
      [medicineId]: String(nextQuantity)
    }));
  };

  const addItemToInvoice = (medicine, quantity = '1') => {
    const requestedQuantity = Number(quantity);

    if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
      alert('Please enter a valid quantity.');
      return;
    }

    const existingItem = invoiceItems.find((item) => item.id === medicine.id);
    const updatedQuantity = existingItem ? existingItem.quantity + requestedQuantity : requestedQuantity;
    const maxQuantity = getMaximumBillQuantity(medicine.id);

    if (updatedQuantity > maxQuantity) {
      alert(`Only ${maxQuantity} units are available for this bill.`);
      return;
    }

    touchDraft('Medicines changed. Generate the bill again to refresh the invoice preview.');

    if (existingItem) {
      setInvoiceItems((previousItems) => previousItems.map((item) => (
        item.id === medicine.id ? { ...item, quantity: updatedQuantity } : item
      )));
    } else {
      setInvoiceItems((previousItems) => [
        ...previousItems,
        {
          id: medicine.id,
          name: medicine.name,
          price: medicine.price,
          priceUnit: medicine.priceUnit || 'strip',
          quantity: requestedQuantity,
          description: medicine.description,
          batchNo: medicine.batchNumber || 'N/A',
          expiryDate: medicine.expiryDate || null
        }
      ]);
    }

    setQuantities((previousQuantities) => ({
      ...previousQuantities,
      [medicine.id]: '1'
    }));
  };

  const updateItemQuantity = (itemId, nextQuantity) => {
    if (nextQuantity <= 0) {
      setInvoiceItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
      touchDraft('Medicine removed. Generate the bill again to refresh the invoice preview.');
      return;
    }

    const maxQuantity = getMaximumBillQuantity(itemId);

    if (nextQuantity > maxQuantity) {
      alert(`Only ${maxQuantity} units are available for this bill.`);
      return;
    }

    touchDraft('Quantity changed. Generate the bill again to refresh the invoice preview.');
    setInvoiceItems((previousItems) => previousItems.map((item) => (
      item.id === itemId ? { ...item, quantity: nextQuantity } : item
    )));
  };

  const removeItemFromInvoice = (itemId) => {
    touchDraft('Medicine removed. Generate the bill again to refresh the invoice preview.');
    setInvoiceItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
  };

  const getInvoiceCanvas = async () => {
    const previewElement = document.getElementById('invoice-preview');

    if (!previewElement) {
      throw new Error('Invoice preview not found.');
    }

    return html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!generatedInvoice) {
      alert('Generate the bill before downloading the invoice.');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await getInvoiceCanvas();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - (margin * 2));

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - (margin * 2));
      }

      const customerName = (generatedInvoice.customer?.name || 'invoice')
        .replace(/\s+/g, '-')
        .toLowerCase();

      pdf.save(`bill-${customerName}-${generatedInvoice.id}.pdf`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!generatedInvoice) {
      alert('Generate the bill before printing the invoice.');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await getInvoiceCanvas();
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank', 'width=900,height=1200');

      if (!printWindow) {
        throw new Error('Unable to open print window.');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Sri Krishna Medicals Bill</title>
            <style>
              body { margin: 0; padding: 24px; background: #eef4f2; display: flex; justify-content: center; }
              img { width: 100%; max-width: 820px; display: block; }
              @media print {
                body { padding: 0; background: #ffffff; }
                img { max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Bill preview" onload="window.print(); setTimeout(() => window.close(), 300);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice.');
    } finally {
      setIsExporting(false);
    }
  };

  const buildInvoicePayload = () => ({
    customer: buildInvoiceCustomer(),
    doctorName: billingDetails.doctorName.trim(),
    items: invoiceItems,
    taxRate: gstRate / 100,
    discountRate: discountRate / 100,
    shipping: 0,
    status: invoiceStatus,
    dueDate: new Date().toISOString()
  });

  const persistBill = async (showPreview = false) => {
    if (invoiceItems.length === 0) {
      alert('Please add at least one medicine.');
      return;
    }

    setIsSaving(true);

    try {
      const { invoice, error } = await saveInvoiceWithStock(
        buildInvoicePayload(),
        savedInvoiceId
      );

      if (error || !invoice) {
        alert(error || 'Failed to save bill.');
        return;
      }

      setSavedInvoiceId(invoice.id);
      setSavedInvoiceItems(invoice.items || []);
      setGeneratedInvoice(showPreview ? invoice : null);
      await refreshBillingData();
      setStatusMessage(
        showPreview
          ? (savedInvoiceId
              ? 'Bill updated. The latest invoice is ready below.'
              : 'Bill generated successfully. Print or download the invoice below.')
          : (savedInvoiceId
              ? 'Bill updated successfully. Open invoice history to review saved bills.'
              : 'Bill saved successfully. Open invoice history to review saved bills.')
      );
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateBill = async () => {
    await persistBill(true);
  };

  const handleStartNewBill = () => {
    setBillingDetails(EMPTY_BILLING_DETAILS);
    setInvoiceItems([]);
    setSearchTerm('');
    setQuantities({});
    setInvoiceStatus('pending');
    setGstRate(12);
    setDiscountRate(10);
    setGeneratedInvoice(null);
    setSavedInvoiceId(null);
    setSavedInvoiceItems([]);
    setStatusMessage('Ready to create a fresh bill.');
  };

  return (
    <motion.div className="create-invoice billing-page">
      {statusMessage && (
        <div className={`billing-message ${generatedInvoice ? 'success' : 'info'}`}>
          {statusMessage}
        </div>
      )}

      <div className="create-invoice-content billing-layout">
        <div className="invoice-form-panel billing-builder-panel">
          <section className="billing-section">
            <div className="billing-section-head">
              <div className="section-step">1</div>
              <div>
                <h3>Walk-in Bill Details</h3>
                <p>Enter the customer name and details only for this invoice.</p>
              </div>
            </div>

            <div className="manual-billing-card">
              <div className="manual-billing-head">
                <h4>Walk-in Customer Entry</h4>
                <p>
                  These details are saved only on this invoice at billing time.
                </p>
              </div>

              <div className="billing-input-grid">
                <label className="billing-input-field">
                  <span>Customer Name</span>
                  <input
                    type="text"
                    name="customerName"
                    value={billingDetails.customerName}
                    onChange={handleBillingDetailChange}
                    placeholder="Walk-in customer name"
                  />
                </label>

                <label className="billing-input-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    value={billingDetails.phone}
                    onChange={handleBillingDetailChange}
                    placeholder="Customer phone number"
                  />
                </label>

                <label className="billing-input-field billing-input-field-wide">
                  <span>Address</span>
                  <textarea
                    name="address"
                    value={billingDetails.address}
                    onChange={handleBillingDetailChange}
                    placeholder="Customer address"
                    rows="3"
                  />
                </label>

                <label className="billing-input-field billing-input-field-wide">
                  <span>Doctor Name</span>
                  <input
                    type="text"
                    name="doctorName"
                    value={billingDetails.doctorName}
                    onChange={handleBillingDetailChange}
                    placeholder="Doctor name if needed"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="billing-section">
            <div className="billing-section-head">
              <div className="section-step">2</div>
              <div>
                <h3>Add Medicines</h3>
                <p>Search current stock, set quantity, and build the bill line by line.</p>
              </div>
            </div>

            <div className="medicine-search billing-search-shell">
              <div className="search-input">
                <FaSearch className="search-icon" />
                <input
                  type="search"
                  inputMode="search"
                  placeholder="Search medicines by name, batch, category, or manufacturer"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="medicine-grid billing-medicine-grid">
              {filteredMedicines.length === 0 ? (
                <div className="empty-items">
                  <FaPills className="empty-icon" />
                  <p>No medicines match your search.</p>
                </div>
              ) : (
                filteredMedicines.map((medicine) => {
                  const currentQuantity = quantities[medicine.id] ?? '1';
                  const existingDraftQuantity = invoiceItems.find((item) => item.id === medicine.id)?.quantity || 0;
                  const referenceQuantity = getReferenceInvoiceQuantity(medicine.id);
                  const maxQuantity = getMaximumBillQuantity(medicine.id);
                  const outOfStock = maxQuantity === 0;
                  const disableAdd = existingDraftQuantity >= maxQuantity;
                  const stockLabel = referenceQuantity > 0
                    ? `${medicine.stock} in stock + ${referenceQuantity} saved`
                    : `${medicine.stock} in stock`;

                  return (
                    <motion.div
                      key={medicine.id}
                      className="medicine-card billing-medicine-card"
                      whileHover={{ y: -4 }}
                    >
                      <div className="medicine-header">
                        <div className="medicine-icon">
                          <FaPills />
                        </div>
                        <div className={`stock-badge ${outOfStock ? 'out' : 'available'}`}>
                          {outOfStock ? 'Out of Stock' : stockLabel}
                        </div>
                      </div>

                      <div className="medicine-content">
                        <div className="billing-medicine-title-row">
                          <h3 className="medicine-name">{medicine.name}</h3>
                          <span className="price-chip">{formatCurrency(medicine.price)}</span>
                        </div>

                        <div className="billing-medicine-meta">
                          <span>{medicine.category || 'General Medicine'}</span>
                          <span>{medicine.manufacturer || 'Sri Krishna Medicals'}</span>
                        </div>
                        <div className="billing-medicine-meta">
                          <span>Batch: {medicine.batchNumber || 'N/A'}</span>
                          <span>{formatPriceUnit(medicine.priceUnit)}</span>
                        </div>
                        <div className="billing-medicine-meta">
                          <span>Expiry: {medicine.expiryDate ? formatDate(medicine.expiryDate) : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="medicine-actions billing-card-actions">
                        <div className="quantity-control">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={currentQuantity}
                            onChange={(event) => updateQuantityInput(
                              medicine.id,
                              event.target.value,
                              maxQuantity
                            )}
                          />
                          <span className="stock-hint">Qty</span>
                        </div>

                        <motion.button
                          type="button"
                          className="btn-primary add-to-bill"
                          onClick={() => addItemToInvoice(medicine, currentQuantity)}
                          disabled={outOfStock || disableAdd}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <FaPlus className="button-glyph" />
                          Add
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="invoice-preview-panel billing-review-panel">
          <div className="invoice-items draft-summary-card">
            <div className="draft-summary-top">
              <div>
                <h3>Draft Bill Summary</h3>
                <p>Review subtotal, discount, GST, and final total before generating the invoice.</p>
              </div>

              <div className="draft-summary-controls">
                <label className="draft-summary-control">
                  <span>Status</span>
                  <select
                    value={invoiceStatus}
                    onChange={(event) => {
                      touchDraft('Bill status changed. Generate the bill again to refresh the invoice preview.');
                      setInvoiceStatus(event.target.value);
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>

                <label className="draft-summary-control">
                  <span>GST</span>
                  <select
                    value={gstRate}
                    onChange={(event) => {
                      touchDraft('GST changed. Generate the bill again to refresh the invoice preview.');
                      setGstRate(Number(event.target.value));
                    }}
                  >
                    {GST_OPTIONS.map((rate) => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </label>

                <label className="draft-summary-control">
                  <span>Discount</span>
                  <select
                    value={discountRate}
                    onChange={(event) => {
                      touchDraft('Discount changed. Generate the bill again to refresh the invoice preview.');
                      setDiscountRate(Number(event.target.value));
                    }}
                  >
                    {DISCOUNT_OPTIONS.map((rate) => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {invoiceItems.length === 0 ? (
              <div className="empty-items bill-summary-empty">
                <FaReceipt className="empty-icon" />
                <p>Add medicines to see the live bill summary.</p>
              </div>
            ) : (
              <>
                <div className="items-list">
                  {invoiceItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="invoice-item"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">
                          {formatCurrency(item.price)}
                          {' '}
                          /
                          {' '}
                          {formatPriceUnit(item.priceUnit)}
                          {' '}
                          | Batch
                          {' '}
                          {item.batchNo || 'N/A'}
                        </div>
                      </div>

                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-total">{formatCurrency(item.quantity * item.price)}</div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() => removeItemFromInvoice(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="invoice-summary bill-summary-breakdown">
                  <div className="summary-row">
                    <span>Medicine Amount</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Discount ({discountRate}%)</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Taxable Amount</span>
                    <span>{formatCurrency(taxableSubtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST ({gstRate}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Grand Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="invoice-actions bill-action-row">
              <motion.button
                type="button"
                className="btn-secondary"
                onClick={handleStartNewBill}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={invoiceItems.length === 0 && !generatedInvoice}
              >
                <FaSyncAlt />
                New Bill
              </motion.button>

              <motion.button
                type="button"
                className="btn-secondary bill-save-button"
                onClick={() => persistBill(false)}
                disabled={invoiceItems.length === 0 || isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaReceipt />
                {isSaving ? 'Saving...' : savedInvoiceId ? 'Update Bill' : 'Save Bill'}
              </motion.button>

              <motion.button
                type="button"
                className="btn-primary bill-generate-button"
                onClick={handleGenerateBill}
                disabled={invoiceItems.length === 0 || isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFileInvoice className="button-glyph" />
                {isSaving ? 'Generating...' : generatedInvoice ? 'Update Bill' : 'Generate Bill'}
              </motion.button>
            </div>
          </div>

          <div className="invoice-preview-section bill-preview-section">
            <div className="invoice-preview-header">
              <div>
                <h3>Compact Invoice Preview</h3>
                <p className="bill-preview-caption">
                  {generatedInvoice
                    ? `Invoice ${generatedInvoice.id} is ready with ${discountRate}% discount applied.`
                    : 'The invoice preview will appear here after you generate the bill.'}
                </p>
              </div>

              <div className="preview-actions">
                <motion.button
                  type="button"
                  className="btn-secondary preview-action-btn history"
                  onClick={() => navigate('/invoice-history')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaReceipt />
                  View History
                </motion.button>

                {generatedInvoice && (
                  <>
                    <motion.button
                      type="button"
                      className="btn-secondary preview-action-btn print"
                      onClick={handlePrintInvoice}
                      disabled={isExporting}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaPrint />
                      {isExporting ? 'Working...' : 'Print'}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn-secondary preview-action-btn download"
                      onClick={handleDownloadInvoice}
                      disabled={isExporting}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaDownload />
                      Download
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            <div className="invoice-preview-container billing-preview-container">
              {generatedInvoice ? (
                <InvoicePreview invoice={generatedInvoice} />
              ) : (
                <div className="bill-preview-placeholder">
                  <FaFileInvoice className="empty-icon" />
                  <h4>Preview locked until bill generation</h4>
                  <p>
                    Add medicines, set GST and discount, then generate the bill to
                    open the final compact invoice preview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateInvoice;
