import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaBoxes,
  FaCapsules,
  FaClipboardList,
  FaHandHoldingMedical,
  FaLayerGroup,
  FaReceipt,
  FaRupeeSign,
  FaUsers
} from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';
import { calculateInvoiceFinancials } from '../utils/invoiceMath';
import {
  getMedicines,
  getCustomers,
  getInvoices,
  initializeDefaultData
} from '../utils/localStorageManager';

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await initializeDefaultData();

      const [loadedMedicines, loadedCustomers, loadedInvoices] = await Promise.all([
        getMedicines(),
        getCustomers(),
        getInvoices()
      ]);

      setMedicines(loadedMedicines);
      setCustomers(loadedCustomers);
      setInvoices(loadedInvoices);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + calculateInvoiceFinancials(invoice).totalAmount,
    0
  );
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const lowStockItems = medicines.filter(medicine => medicine.stock <= (medicine.minStockLevel || 10));
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
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

  if (loading) {
    return null;
  }

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Monitor billing, inventory, and customer activity from one responsive workspace.</p>
        </div>
      </motion.div>

      <motion.div className="dashboard-stats-grid" variants={itemVariants}>
        <DashboardCard
          title="Medicines"
          value={medicines.length.toString()}
          subtitle="Items in inventory"
          icon={<FaCapsules />}
          color="#0F766E"
        />
        <DashboardCard
          title="Customers"
          value={customers.length.toString()}
          subtitle="Saved customer records"
          icon={<FaUsers />}
          color="#D97706"
        />
        <DashboardCard
          title="Bills Created"
          value={invoices.length.toString()}
          subtitle={`${pendingInvoices} pending`}
          icon={<FaReceipt />}
          color="#14532D"
        />
        <DashboardCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="From saved bills"
          icon={<FaRupeeSign />}
          color="#1D4ED8"
        />
      </motion.div>

      <motion.div className="dashboard-actions" variants={itemVariants}>
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <motion.button
            className="action-card"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/medicines')}
          >
            <div className="action-icon" style={{ background: 'rgba(15, 118, 110, 0.12)', color: '#0F766E' }}>
              <FaBoxes />
            </div>
            <div className="action-content">
              <h3>Manage Medicines</h3>
              <p>Add stock and review inventory levels</p>
            </div>
          </motion.button>

          <motion.button
            className="action-card"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/customers')}
          >
            <div className="action-icon" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#D97706' }}>
              <FaUsers />
            </div>
            <div className="action-content">
              <h3>Manage Customers</h3>
              <p>Keep customer details ready for billing</p>
            </div>
          </motion.button>

          <motion.button
            className="action-card"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/billing')}
          >
            <div className="action-icon" style={{ background: 'rgba(20, 83, 45, 0.12)', color: '#14532D' }}>
              <FaClipboardList />
            </div>
            <div className="action-content">
              <h3>Create Bill</h3>
              <p>Enter customer details and generate a bill</p>
            </div>
          </motion.button>

          <motion.button
            className="action-card"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/medicines')}
          >
            <div className="action-icon" style={{ background: 'rgba(29, 78, 216, 0.12)', color: '#1D4ED8' }}>
              <FaHandHoldingMedical />
            </div>
            <div className="action-content">
              <h3>Check Low Stock</h3>
              <p>{lowStockItems.length} medicines need attention</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="dashboard-shop-insights" variants={itemVariants}>
        <h2>Inventory Snapshot</h2>
        <div className="insights-grid">
          <DashboardCard
            title="Low Stock"
            value={lowStockItems.length.toString()}
            subtitle="Needs restocking"
            icon={<FaLayerGroup />}
            color="#EF4444"
          />
          <DashboardCard
            title="In Stock"
            value={medicines.filter(medicine => medicine.stock > (medicine.minStockLevel || 10)).length.toString()}
            subtitle="Healthy inventory"
            icon={<FaBoxes />}
            color="#10B981"
          />
          <DashboardCard
            title="Pending Bills"
            value={pendingInvoices.toString()}
            subtitle="Saved with pending status"
            icon={<FaReceipt />}
            color="#F59E0B"
          />
        </div>
      </motion.div>

      <motion.div className="dashboard-recent" variants={itemVariants}>
        <div className="section-header">
          <h2>Recent Bills</h2>
          <motion.button
            type="button"
            className="view-all-btn"
            onClick={() => navigate('/invoice-history')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Open Invoice History
          </motion.button>
        </div>

        {recentInvoices.length > 0 ? (
          <div className="recent-invoices-list">
            {recentInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                className="recent-invoice-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
              >
                <div className="invoice-info">
                  <div className="invoice-id">#{invoice.id}</div>
                  <div className="invoice-customer">{invoice.customer?.name || 'N/A'}</div>
                  <div className="invoice-date">{formatDate(invoice.createdAt)}</div>
                </div>

                <div className="invoice-amount">
                  <div className="amount">{formatCurrency(calculateInvoiceFinancials(invoice).totalAmount)}</div>
                  <div className={`status ${invoice.status || 'pending'}`}>
                    {invoice.status || 'Pending'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">BILL</div>
            <h3>No bills yet</h3>
            <p>Create your first bill to see it here.</p>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/billing')}
            >
              Go to Billing
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
