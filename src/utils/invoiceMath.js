import { calculateLineTotal } from './medicinePricing';

const normalizeRate = (value, fallback = 0) => {
  const parsedRate = Number(value);

  if (!Number.isFinite(parsedRate)) {
    return fallback;
  }

  if (parsedRate > 1) {
    return parsedRate / 100;
  }

  return parsedRate;
};

export const calculateInvoiceFinancials = (invoice = {}, options = {}) => {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = typeof invoice.subtotal === 'number'
    ? invoice.subtotal
    : items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const discountRate = normalizeRate(invoice.discountRate, options.defaultDiscountRate || 0);
  const discountAmount = typeof invoice.discountAmount === 'number'
    ? invoice.discountAmount
    : subtotal * discountRate;
  const taxableSubtotal = Math.max(subtotal - discountAmount, 0);
  const taxRate = normalizeRate(invoice.taxRate, options.defaultTaxRate || 0);
  const taxAmount = typeof invoice.taxAmount === 'number'
    ? invoice.taxAmount
    : taxableSubtotal * taxRate;
  const shipping = typeof invoice.shipping === 'number' ? invoice.shipping : 0;
  const totalAmount = typeof invoice.totalAmount === 'number'
    ? invoice.totalAmount
    : taxableSubtotal + taxAmount + shipping;

  return {
    subtotal,
    discountRate,
    discountAmount,
    taxableSubtotal,
    taxRate,
    taxAmount,
    shipping,
    totalAmount
  };
};
