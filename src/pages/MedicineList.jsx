import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaPlus, FaTrash, FaBoxes, FaPills } from 'react-icons/fa';
import MedicineForm from '../components/MedicineForm';
import SearchBar from '../components/SearchBar';
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  initializeDefaultData
} from '../utils/localStorageManager';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      await initializeDefaultData();
      setMedicines(await getMedicines());
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async (medicineData) => {
    try {
      const savedMedicine = editingMedicine
        ? await updateMedicine(editingMedicine.id, medicineData)
        : await addMedicine(medicineData);

      if (savedMedicine) {
        setMedicines(prev => (
          editingMedicine
            ? prev.map(medicine => (
              medicine.id === editingMedicine.id ? savedMedicine : medicine
            ))
            : [savedMedicine, ...prev]
        ));
        setEditingMedicine(null);
        setShowForm(false);
        alert(editingMedicine ? 'Medicine updated successfully!' : 'Medicine added successfully!');
      } else {
        alert(editingMedicine ? 'Failed to update medicine' : 'Failed to add medicine');
      }
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert(editingMedicine ? 'Error updating medicine' : 'Error adding medicine');
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const success = await deleteMedicine(medicineId);
        if (success) {
          setMedicines(prev => prev.filter(medicine => medicine.id !== medicineId));
        } else {
          alert('Failed to delete medicine');
        }
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Error deleting medicine');
      }
    }
  };

  const getStockStatus = (medicine) => {
    if (medicine.stock === 0) return { status: 'out', label: 'Out of Stock' };
    if (medicine.stock <= (medicine.minStockLevel || 10)) return { status: 'low', label: 'Low Stock' };
    return { status: 'available', label: 'In Stock' };
  };

  const getCategories = () => {
    return [...new Set(medicines.map(medicine => medicine.category).filter(Boolean))];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPriceUnit = (priceUnit) => {
    return priceUnit === 'tablet' ? 'per tablet' : 'per strip';
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'All Categories', value: 'all' },
        ...getCategories().map(category => ({ label: category, value: category }))
      ]
    },
    {
      key: 'stock',
      label: 'Stock Status',
      options: [
        { label: 'All', value: 'all' },
        { label: 'In Stock', value: 'available' },
        { label: 'Low Stock', value: 'low' },
        { label: 'Out of Stock', value: 'out' }
      ]
    }
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = medicine.stock <= (medicine.minStockLevel || 10);
    } else if (stockFilter === 'out') {
      matchesStock = medicine.stock === 0;
    } else if (stockFilter === 'available') {
      matchesStock = medicine.stock > (medicine.minStockLevel || 10);
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return null;
  }

  return (
    <motion.div
      className="medicine-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={cardVariants}>
        <div className="header-content">
          <h1>Medicine Inventory</h1>
          <p>Add medicines, review stock, and maintain a simple inventory list.</p>
        </div>
        <div className="header-actions">
          <motion.button
            className="btn-primary"
            onClick={() => {
              if (showForm) {
                setEditingMedicine(null);
                setShowForm(false);
                return;
              }

              setEditingMedicine(null);
              setShowForm(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus className="btn-icon" />
            {showForm ? 'Close Form' : 'Add Medicine'}
          </motion.button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div variants={cardVariants}>
          <MedicineForm
            medicine={editingMedicine}
            isEditing={Boolean(editingMedicine)}
            onSave={handleSaveMedicine}
            onCancel={() => {
              setEditingMedicine(null);
              setShowForm(false);
            }}
          />
        </motion.div>
      )}

      <motion.div className="search-filters" variants={cardVariants}>
        <SearchBar
          placeholder="Search medicines by name or description..."
          onSearch={(query, filters) => {
            setSearchTerm(query);
            if (filters) {
              setCategoryFilter(filters.category || 'all');
              setStockFilter(filters.stock || 'all');
            }
          }}
          filters={filterOptions}
        />
      </motion.div>

      <motion.div className="stats-grid" variants={cardVariants}>
        <div className="stat-card">
          <div className="stat-icon total">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>{medicines.length}</h3>
            <p>Total Medicines</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>{medicines.filter(medicine => medicine.stock > (medicine.minStockLevel || 10)).length}</h3>
            <p>In Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon low">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>{medicines.filter(medicine => medicine.stock <= (medicine.minStockLevel || 10) && medicine.stock > 0).length}</h3>
            <p>Low Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon out">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>{medicines.filter(medicine => medicine.stock === 0).length}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="medicine-grid" variants={cardVariants}>
        {filteredMedicines.length === 0 ? (
          <div className="empty-state">
            <FaBoxes className="empty-icon" />
            <h3>No medicines found</h3>
            <p>Try adjusting your search or add the first medicine.</p>
            <motion.button
              className="btn-primary"
              onClick={() => {
                setEditingMedicine(null);
                setShowForm(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="btn-icon" />
              Add First Medicine
            </motion.button>
          </div>
        ) : (
          filteredMedicines.map((medicine, index) => {
            const stockStatus = getStockStatus(medicine);
            return (
              <motion.div
                key={medicine.id}
                className="medicine-card"
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="medicine-header">
                  <div className="medicine-icon">
                    <FaPills />
                  </div>
                  <div className={`stock-badge ${stockStatus.status}`}>{stockStatus.label}</div>
                </div>

                <div className="medicine-content">
                  <h3 className="medicine-name">{medicine.name}</h3>
                  <p className="medicine-description">{medicine.description}</p>

                  <div className="medicine-details">
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span className="value">
                        {formatCurrency(medicine.price)} / {formatPriceUnit(medicine.priceUnit)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Stock:</span>
                      <span className="value">{medicine.stock} units</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span className="value">{medicine.category || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Expiry:</span>
                      <span className="value">{formatDate(medicine.expiryDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="medicine-actions">
                  <motion.button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingMedicine(medicine);
                      setShowForm(true);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Update Medicine Stock"
                  >
                    <FaEdit />
                  </motion.button>

                  <motion.button
                    className="action-btn delete"
                    onClick={() => handleDeleteMedicine(medicine.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete Medicine"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
};

export default MedicineList;
