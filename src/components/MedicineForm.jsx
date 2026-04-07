import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';

const MAX_STOCK_QUANTITY = 200;
const INITIAL_FORM_DATA = {
  name: '',
  price: '',
  priceUnit: 'strip',
  stock: '',
  expiryDate: '',
  description: '',
  category: '',
  manufacturer: '',
  batchNumber: '',
  minStockLevel: ''
};

const MedicineForm = ({ medicine, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        price: medicine.price ?? '',
        priceUnit: medicine.priceUnit || 'strip',
        stock: medicine.stock ?? '',
        expiryDate: medicine.expiryDate || '',
        description: medicine.description || '',
        category: medicine.category || '',
        manufacturer: medicine.manufacturer || '',
        batchNumber: medicine.batchNumber || '',
        minStockLevel: medicine.minStockLevel ?? ''
      });
      setErrors({});
      return;
    }

    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }, [medicine]);

  const handleInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'name') {
      value = value.replace(/[^A-Za-z0-9\s-]/g, '');
      value = value.replace(/^[^A-Za-z]+/, '');
    }

    if (name === 'stock' || name === 'minStockLevel') {
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));

        if (errors[name]) {
          setErrors(prev => ({
            ...prev,
            [name]: ''
          }));
        }

        return;
      }

      const numericValue = Math.min(
        Math.max(Number.parseInt(value, 10) || 0, 0),
        MAX_STOCK_QUANTITY
      );
      value = String(numericValue);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const stockValue = Number(formData.stock);
    const minStockValue = Number(formData.minStockLevel || 0);

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    } else if (!/^[A-Za-z][A-Za-z0-9\s-]*$/.test(formData.name.trim())) {
      newErrors.name = 'Medicine name must start with a letter';
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.priceUnit !== 'strip' && formData.priceUnit !== 'tablet') {
      newErrors.priceUnit = 'Select a valid price type';
    }

    if (!formData.stock || stockValue < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    } else if (stockValue > MAX_STOCK_QUANTITY) {
      newErrors.stock = `Stock quantity cannot exceed ${MAX_STOCK_QUANTITY}`;
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const today = new Date();
      const expiry = new Date(formData.expiryDate);
      if (expiry <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    if (formData.minStockLevel) {
      if (minStockValue < 0) {
        newErrors.minStockLevel = 'Minimum stock level cannot be negative';
      } else if (minStockValue > MAX_STOCK_QUANTITY) {
        newErrors.minStockLevel = `Minimum stock cannot exceed ${MAX_STOCK_QUANTITY}`;
      } else if (formData.stock && minStockValue > stockValue) {
        newErrors.minStockLevel = 'Minimum stock cannot be greater than stock quantity';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        priceUnit: formData.priceUnit,
        stock: parseInt(formData.stock, 10),
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel, 10) : 0
      };

      await onSave(medicineData);
    } catch (error) {
      console.error('Error saving medicine:', error);
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

  const categories = [
    'Pain Relief',
    'Antibiotics',
    'Cardiovascular',
    'Diabetes',
    'Respiratory',
    'Gastrointestinal',
    'Neurological',
    'Dermatological',
    'Vitamins & Supplements',
    'Other'
  ];

  return (
    <motion.form
      className="medicine-form"
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="form-header">
        <h2>{isEditing ? 'Update Medicine / Stock' : 'Add New Medicine'}</h2>
        <p>{isEditing ? 'Edit the medicine details and stock below' : 'Enter the medicine details below'}</p>
      </div>

      <div className="form-grid">
        <motion.div className="form-section" variants={fieldVariants}>
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="name">Medicine Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter medicine name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (Rs) *</label>
              <div className="input-with-icon">
                <FaRupeeSign className="input-icon" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={errors.price ? 'error' : ''}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="priceUnit">Price Type *</label>
              <select
                id="priceUnit"
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleInputChange}
                className={errors.priceUnit ? 'error' : ''}
              >
                <option value="strip">Per Strip</option>
                <option value="tablet">Per Tablet</option>
              </select>
              {errors.priceUnit && <span className="error-message">{errors.priceUnit}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity * (max {MAX_STOCK_QUANTITY})</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={errors.stock ? 'error' : ''}
                placeholder="0"
                min="0"
                max={MAX_STOCK_QUANTITY}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className={errors.expiryDate ? 'error' : ''}
                />
              </div>
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>
          </div>
        </motion.div>

        <motion.div className="form-section" variants={fieldVariants}>
          <h3>Additional Information</h3>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Enter manufacturer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="batchNumber">Batch Number</label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                placeholder="Enter batch number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minStockLevel">Minimum Stock Level</label>
            <input
              type="number"
              id="minStockLevel"
              name="minStockLevel"
              value={formData.minStockLevel}
              onChange={handleInputChange}
              className={errors.minStockLevel ? 'error' : ''}
              placeholder="0"
              min="0"
              max={MAX_STOCK_QUANTITY}
            />
            {errors.minStockLevel && <span className="error-message">{errors.minStockLevel}</span>}
          </div>
        </motion.div>

        <motion.div className="form-section full-width" variants={fieldVariants}>
          <h3>Description</h3>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter medicine description..."
              rows="4"
            />
          </div>
        </motion.div>
      </div>

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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Medicine' : 'Save Medicine'}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default MedicineForm;
