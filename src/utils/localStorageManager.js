import { normalizePacking, normalizeUnit } from './medicinePricing';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_SESSION: 'authSession',
  MEDICINES: 'medicines',
  CUSTOMERS: 'customers',
  INVOICES: 'invoices'
};

const normalizeCurrencyValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
};

const normalizeIntegerValue = (value) => {
  const numericValue = Number.parseInt(value, 10);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
};

const idsMatch = (firstId, secondId) => String(firstId) === String(secondId);

const normalizeMedicineRecord = (medicine = {}) => ({
  ...medicine,
  price: normalizeCurrencyValue(medicine.price),
  priceUnit: normalizeUnit(medicine.priceUnit),
  packing: normalizePacking(medicine.packing),
  stock: normalizeIntegerValue(medicine.stock),
  minStockLevel: normalizeIntegerValue(medicine.minStockLevel),
  description: medicine.description || '',
  category: medicine.category || '',
  manufacturer: medicine.manufacturer || '',
  batchNumber: medicine.batchNumber || '',
  expiryDate: medicine.expiryDate || ''
});

const normalizeInvoiceItem = (item = {}) => {
  const billingUnit = normalizeUnit(item.billingUnit || item.priceUnit);
  const medicineId = item.medicineId ?? item.id;

  return {
    ...item,
    id: item.id ?? medicineId ?? Date.now(),
    medicineId,
    price: normalizeCurrencyValue(item.unitPrice ?? item.price),
    unitPrice: normalizeCurrencyValue(item.unitPrice ?? item.price),
    priceUnit: billingUnit,
    billingUnit,
    inventoryUnit: normalizeUnit(item.inventoryUnit || item.priceUnit),
    packing: normalizePacking(item.packing),
    quantity: normalizeIntegerValue(item.quantity),
    description: item.description || '',
    batchNo: item.batchNo || item.batchNumber || 'N/A',
    expiryDate: item.expiryDate || null
  };
};

const normalizeInvoiceRecord = (invoice = {}) => {
  const fallbackTimestamp = invoice.createdAt || invoice.updatedAt || new Date().toISOString();

  return {
    ...invoice,
    createdAt: invoice.createdAt || fallbackTimestamp,
    updatedAt: invoice.updatedAt || fallbackTimestamp,
    status: invoice.status || 'pending',
    items: Array.isArray(invoice.items) ? invoice.items.map(normalizeInvoiceItem) : []
  };
};

const readNormalizedCollection = (storageKey, normalizer) => {
  const records = getStorageItem(storageKey, []).map(normalizer);
  setStorageItem(storageKey, records);
  return records;
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

const clearAuthSession = () => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  removeStorageItem(STORAGE_KEYS.AUTH_SESSION);
};

const getAuthToken = () => getStorageItem(STORAGE_KEYS.AUTH_TOKEN, null);

export const login = async (credentials) => {
  // Simulate login
  const user = { id: 1, name: 'Admin', email: credentials.email };
  const token = 'dummy-token';
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
  setStorageItem(STORAGE_KEYS.AUTH_SESSION, user);
  return user;
};

export const logout = () => {
  clearAuthSession();
  return true;
};

export const getCurrentUser = () => getStorageItem(STORAGE_KEYS.AUTH_SESSION, null);

export const isAuthenticated = () => Boolean(getAuthToken() && getCurrentUser());

export const getMedicines = async () => {
  return readNormalizedCollection(STORAGE_KEYS.MEDICINES, normalizeMedicineRecord);
};

export const addMedicine = async (medicine) => {
  const medicines = await getMedicines();
  const newMedicine = normalizeMedicineRecord({ ...medicine, id: Date.now() });
  medicines.push(newMedicine);
  setStorageItem(STORAGE_KEYS.MEDICINES, medicines);
  return newMedicine;
};

export const updateMedicine = async (id, updatedMedicine) => {
  const medicines = await getMedicines();
  const index = medicines.findIndex((medicine) => idsMatch(medicine.id, id));

  if (index !== -1) {
    medicines[index] = normalizeMedicineRecord({
      ...medicines[index],
      ...updatedMedicine
    });
    setStorageItem(STORAGE_KEYS.MEDICINES, medicines);
    return medicines[index];
  }

  return null;
};

export const deleteMedicine = async (id) => {
  const medicines = await getMedicines();
  const filtered = medicines.filter((medicine) => !idsMatch(medicine.id, id));
  setStorageItem(STORAGE_KEYS.MEDICINES, filtered);
  return true;
};

export const getMedicineById = async (id) => {
  const medicines = await getMedicines();
  return medicines.find((medicine) => idsMatch(medicine.id, id)) || null;
};

export const getCustomers = async () => {
  return getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
};

export const addCustomer = async (customer) => {
  const customers = getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
  const newCustomer = { ...customer, id: Date.now() };
  customers.push(newCustomer);
  setStorageItem(STORAGE_KEYS.CUSTOMERS, customers);
  return newCustomer;
};

export const updateCustomer = async (id, updatedCustomer) => {
  const customers = getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
  const index = customers.findIndex(c => c.id == id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updatedCustomer };
    setStorageItem(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  }
  return null;
};

export const deleteCustomer = async (id) => {
  const customers = getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
  const filtered = customers.filter(c => c.id != id);
  setStorageItem(STORAGE_KEYS.CUSTOMERS, filtered);
  return true;
};

export const getCustomerById = async (id) => {
  const customers = getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
  return customers.find(c => c.id == id) || null;
};

export const getInvoices = async () => {
  return readNormalizedCollection(STORAGE_KEYS.INVOICES, normalizeInvoiceRecord);
};

export const addInvoice = async (invoice) => {
  const invoices = await getInvoices();
  const timestamp = new Date().toISOString();
  const newInvoice = normalizeInvoiceRecord({
    ...invoice,
    id: Date.now(),
    createdAt: timestamp,
    updatedAt: timestamp
  });
  invoices.push(newInvoice);
  setStorageItem(STORAGE_KEYS.INVOICES, invoices);
  return newInvoice;
};

export const updateInvoice = async (id, updatedInvoice) => {
  const invoices = await getInvoices();
  const index = invoices.findIndex((invoice) => idsMatch(invoice.id, id));

  if (index !== -1) {
    invoices[index] = normalizeInvoiceRecord({
      ...invoices[index],
      ...updatedInvoice,
      id: invoices[index].id,
      createdAt: invoices[index].createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setStorageItem(STORAGE_KEYS.INVOICES, invoices);
    return invoices[index];
  }

  return null;
};

export const deleteInvoice = async (id) => {
  const invoices = await getInvoices();
  const filtered = invoices.filter((invoice) => !idsMatch(invoice.id, id));
  setStorageItem(STORAGE_KEYS.INVOICES, filtered);
  return true;
};

export const getInvoiceById = async (id) => {
  const invoices = await getInvoices();
  return invoices.find((invoice) => idsMatch(invoice.id, id)) || null;
};

export const saveInvoiceWithStock = async (invoice, invoiceId = null) => {
  try {
    if (invoiceId) {
      const updated = await updateInvoice(invoiceId, invoice);
      return {
        invoice: updated,
        error: null
      };
    } else {
      const newInv = await addInvoice(invoice);
      return {
        invoice: newInv,
        error: null
      };
    }
  } catch (error) {
    return {
      invoice: null,
      error: error.message
    };
  }
};

export const exportData = async () => {
  try {
    const [medicines, customers, invoices] = await Promise.all([
      getMedicines(),
      getCustomers(),
      getInvoices()
    ]);

    return {
      medicines,
      customers,
      invoices,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = async () => false;

export const initializeDefaultData = async () => true;
