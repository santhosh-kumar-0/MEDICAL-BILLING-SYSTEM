const roundCurrency = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round((numericValue + Number.EPSILON) * 100) / 100;
};

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const normalizeUnit = (unit) => (unit === 'tablet' ? 'tablet' : 'strip');

export const normalizePacking = (value) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
};

export const formatUnitLabel = (unit, { capitalize = false } = {}) => {
  const normalizedUnit = normalizeUnit(unit);
  const label = normalizedUnit === 'tablet' ? 'tablet' : 'strip';

  return capitalize ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label;
};

export const calculateBillingRate = (medicine = {}, billingUnit = medicine.priceUnit) => {
  const sourceUnit = normalizeUnit(medicine.priceUnit);
  const targetUnit = normalizeUnit(billingUnit);
  const basePrice = toNumber(medicine.price, 0);
  const packing = normalizePacking(medicine.packing);

  if (sourceUnit === targetUnit) {
    return roundCurrency(basePrice);
  }

  if (sourceUnit === 'strip' && targetUnit === 'tablet') {
    return roundCurrency(basePrice / packing);
  }

  return roundCurrency(basePrice * packing);
};

export const convertQuantityToInventoryUnits = (
  quantity,
  inventoryUnit = 'strip',
  billingUnit = inventoryUnit,
  packing = 1
) => {
  const normalizedInventoryUnit = normalizeUnit(inventoryUnit);
  const normalizedBillingUnit = normalizeUnit(billingUnit);
  const normalizedPacking = normalizePacking(packing);
  const normalizedQuantity = Math.max(toNumber(quantity, 0), 0);

  if (normalizedInventoryUnit === normalizedBillingUnit) {
    return normalizedQuantity;
  }

  if (normalizedInventoryUnit === 'strip' && normalizedBillingUnit === 'tablet') {
    return normalizedQuantity / normalizedPacking;
  }

  return normalizedQuantity * normalizedPacking;
};

export const convertInventoryToBillingUnits = (
  inventoryQuantity,
  inventoryUnit = 'strip',
  billingUnit = inventoryUnit,
  packing = 1
) => {
  const normalizedInventoryUnit = normalizeUnit(inventoryUnit);
  const normalizedBillingUnit = normalizeUnit(billingUnit);
  const normalizedPacking = normalizePacking(packing);
  const normalizedInventoryQuantity = Math.max(toNumber(inventoryQuantity, 0), 0);

  if (normalizedInventoryUnit === normalizedBillingUnit) {
    return normalizedInventoryQuantity;
  }

  if (normalizedInventoryUnit === 'strip' && normalizedBillingUnit === 'tablet') {
    return normalizedInventoryQuantity * normalizedPacking;
  }

  return Math.floor(normalizedInventoryQuantity / normalizedPacking);
};

export const calculateLineTotal = (item = {}) => {
  const quantity = Math.max(toNumber(item.quantity, 0), 0);
  const rate = toNumber(item.unitPrice ?? item.price, 0);
  return roundCurrency(quantity * rate);
};

