const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_SESSION: 'authSession',
  MEDICINES: 'medicines',
  CUSTOMERS: 'customers',
  INVOICES: 'invoices'
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
  return getStorageItem(STORAGE_KEYS.MEDICINES, []);
};

export const addMedicine = async (medicine) => {
  const medicines = getStorageItem(STORAGE_KEYS.MEDICINES, []);
  const newMedicine = { ...medicine, id: Date.now() };
  medicines.push(newMedicine);
  setStorageItem(STORAGE_KEYS.MEDICINES, medicines);
  return newMedicine;
};

export const updateMedicine = async (id, updatedMedicine) => {
  const medicines = getStorageItem(STORAGE_KEYS.MEDICINES, []);
  const index = medicines.findIndex(m => m.id == id);
  if (index !== -1) {
    medicines[index] = { ...medicines[index], ...updatedMedicine };
    setStorageItem(STORAGE_KEYS.MEDICINES, medicines);
    return medicines[index];
  }
  return null;
};

export const deleteMedicine = async (id) => {
  const medicines = getStorageItem(STORAGE_KEYS.MEDICINES, []);
  const filtered = medicines.filter(m => m.id != id);
  setStorageItem(STORAGE_KEYS.MEDICINES, filtered);
  return true;
};

export const getMedicineById = async (id) => {
  const medicines = getStorageItem(STORAGE_KEYS.MEDICINES, []);
  return medicines.find(m => m.id == id) || null;
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
  return getStorageItem(STORAGE_KEYS.INVOICES, []);
};

export const addInvoice = async (invoice) => {
  const invoices = getStorageItem(STORAGE_KEYS.INVOICES, []);
  const newInvoice = { ...invoice, id: Date.now() };
  invoices.push(newInvoice);
  setStorageItem(STORAGE_KEYS.INVOICES, invoices);
  return newInvoice;
};

export const updateInvoice = async (id, updatedInvoice) => {
  const invoices = getStorageItem(STORAGE_KEYS.INVOICES, []);
  const index = invoices.findIndex(i => i.id == id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updatedInvoice };
    setStorageItem(STORAGE_KEYS.INVOICES, invoices);
    return invoices[index];
  }
  return null;
};

export const deleteInvoice = async (id) => {
  const invoices = getStorageItem(STORAGE_KEYS.INVOICES, []);
  const filtered = invoices.filter(i => i.id != id);
  setStorageItem(STORAGE_KEYS.INVOICES, filtered);
  return true;
};

export const getInvoiceById = async (id) => {
  const invoices = getStorageItem(STORAGE_KEYS.INVOICES, []);
  return invoices.find(i => i.id == id) || null;
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
