import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const CustomerForm = ({ customer, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    creditLimit: '',
    paymentTerms: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        gstNumber: customer.gstNumber || '',
        creditLimit: customer.creditLimit || '',
        paymentTerms: customer.paymentTerms || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (formData.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Please enter a valid GST number';
    }

    if (formData.creditLimit && (isNaN(formData.creditLimit) || formData.creditLimit < 0)) {
      newErrors.creditLimit = 'Credit limit must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const customerData = {
        ...formData,
        phone: formData.phone.replace(/\s+/g, ''), // Remove spaces from phone
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0
      };

      await onSave(customerData);
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const paymentTerms = [
    'Cash on Delivery',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Credit Card',
    'Bank Transfer'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];

  return (
    <motion.form
      className="customer-form"
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="form-header">
        <h2>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
        <p>Enter the customer details below</p>
      </div>

      <div className="form-grid">
        {/* Personal Information */}
        <motion.div className="form-section" variants={fieldVariants}>
          <h3>Personal Information</h3>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="input-with-icon">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="Enter phone number"
                  maxLength="10"
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
        </motion.div>

        {/* Address Information */}
        <motion.div className="form-section" variants={fieldVariants}>
          <h3>Address Information</h3>

          <div className="form-group">
            <label htmlFor="address">Street Address *</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter street address"
                rows="3"
              />
            </div>
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              >
                <option value="">Select state</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className={errors.pincode ? 'error' : ''}
              placeholder="Enter 6-digit pincode"
              maxLength="6"
            />
            {errors.pincode && <span className="error-message">{errors.pincode}</span>}
          </div>
        </motion.div>

        {/* Business Information */}
        <motion.div className="form-section" variants={fieldVariants}>
          <h3>Business Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gstNumber">GST Number</label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleInputChange}
                className={errors.gstNumber ? 'error' : ''}
                placeholder="Enter GST number"
                maxLength="15"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.gstNumber && <span className="error-message">{errors.gstNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="creditLimit">Credit Limit (₹)</label>
              <input
                type="number"
                id="creditLimit"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleInputChange}
                className={errors.creditLimit ? 'error' : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.creditLimit && <span className="error-message">{errors.creditLimit}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentTerms">Payment Terms</label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
            >
              <option value="">Select payment terms</option>
              {paymentTerms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Additional Notes */}
        <motion.div className="form-section full-width" variants={fieldVariants}>
          <h3>Additional Notes</h3>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter any additional notes about the customer..."
              rows="4"
            />
          </div>
        </motion.div>
      </div>

      {/* Form Actions */}
      <motion.div
        className="form-actions"
        variants={fieldVariants}
      >
        <motion.button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          <FaTimes className="btn-icon" />
          Cancel
        </motion.button>

        <motion.button
          type="submit"
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          <FaSave className="btn-icon" />
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Save Customer'}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default CustomerForm;