import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import CustomerForm from '../components/CustomerForm';
import SearchBar from '../components/SearchBar';
import {
  getCustomers,
  addCustomer,
  deleteCustomer,
  initializeDefaultData
} from '../utils/localStorageManager';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      await initializeDefaultData();
      setCustomers(await getCustomers());
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const newCustomer = await addCustomer(customerData);
      if (newCustomer) {
        setCustomers(prev => [newCustomer, ...prev]);
        setShowForm(false);
        alert('Customer added successfully!');
      } else {
        alert('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const success = await deleteCustomer(customerId);
        if (success) {
          setCustomers(prev => prev.filter(customer => customer.id !== customerId));
        } else {
          alert('Failed to delete customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer');
      }
    }
  };

  const getStates = () => {
    return [...new Set(customers.map(customer => customer.state).filter(Boolean))].sort();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const filterOptions = [
    {
      key: 'state',
      label: 'State',
      options: [
        { label: 'All States', value: 'all' },
        ...getStates().map(state => ({ label: state, value: state }))
      ]
    }
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = stateFilter === 'all' || customer.state === stateFilter;
    return matchesSearch && matchesState;
  });

  if (loading) {
    return null;
  }

  return (
    <motion.div
      className="customers"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <div className="header-content">
          <h1>Customer Management</h1>
          <p>Add customers and keep their contact details ready for billing.</p>
        </div>
        <div className="header-actions">
          <motion.button
            className="btn-primary"
            onClick={() => setShowForm(prev => !prev)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus className="btn-icon" />
            {showForm ? 'Close Form' : 'Add Customer'}
          </motion.button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div variants={itemVariants}>
          <CustomerForm onSave={handleSaveCustomer} onCancel={() => setShowForm(false)} />
        </motion.div>
      )}

      <motion.div className="search-filters" variants={itemVariants}>
        <SearchBar
          placeholder="Search customers by name, phone, or email..."
          onSearch={(query, filters) => {
            setSearchTerm(query);
            if (filters) {
              setStateFilter(filters.state || 'all');
            }
          }}
          filters={filterOptions}
        />
      </motion.div>

      <motion.div className="stats-grid" variants={itemVariants}>
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{customers.filter(customer => customer.createdAt).length}</h3>
            <p>Saved Records</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon states">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-content">
            <h3>{getStates().length}</h3>
            <p>States Covered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon recent">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>
              {customers.filter(customer =>
                customer.createdAt &&
                new Date(customer.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </h3>
            <p>New This Month</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="customer-grid" variants={itemVariants}>
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <h3>No customers found</h3>
            <p>Try adjusting your search or use the Add Customer button above.</p>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              className="customer-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="customer-header">
                <div className="customer-avatar">
                  <FaUser />
                </div>
                <div className="customer-basic-info">
                  <h3 className="customer-name">{customer.name}</h3>
                  <p className="customer-since">
                    Customer since {customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="customer-details">
                <div className="detail-row">
                  <FaPhone className="detail-icon" />
                  <span>{customer.phone}</span>
                </div>

                {customer.email && (
                  <div className="detail-row">
                    <FaEnvelope className="detail-icon" />
                    <span>{customer.email}</span>
                  </div>
                )}

                <div className="detail-row">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>
                    {customer.city || 'N/A'}, {customer.state || 'N/A'} {customer.pincode || ''}
                  </span>
                </div>

                {customer.gstNumber && (
                  <div className="detail-row">
                    <span className="detail-label">GST:</span>
                    <span>{customer.gstNumber}</span>
                  </div>
                )}

                {customer.creditLimit ? (
                  <div className="detail-row">
                    <span className="detail-label">Credit Limit:</span>
                    <span>Rs {customer.creditLimit.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}
              </div>

              <div className="customer-address">
                <p>{customer.address || 'No address provided'}</p>
              </div>

              {customer.notes && (
                <div className="customer-notes">
                  <p><strong>Notes:</strong> {customer.notes}</p>
                </div>
              )}

              <div className="customer-actions">
                <motion.button
                  className="action-btn delete"
                  onClick={() => handleDeleteCustomer(customer.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete Customer"
                >
                  <FaTrash />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default Customers;
