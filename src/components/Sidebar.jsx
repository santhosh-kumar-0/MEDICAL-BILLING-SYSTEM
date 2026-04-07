import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaPills,
  FaUsers,
  FaFileInvoice,
  FaReceipt,
  FaBars,
  FaChevronLeft,
  FaSignOutAlt
} from 'react-icons/fa';
import { logout } from '../utils/localStorageManager';

const Sidebar = ({ isCollapsed, isMobile, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: FaTachometerAlt,
      color: '#4F46E5'
    },
    {
      title: 'Medicines',
      path: '/medicines',
      icon: FaPills,
      color: '#DC2626'
    },
    {
      title: 'Customers',
      path: '/customers',
      icon: FaUsers,
      color: '#EA580C'
    },
    {
      title: 'Billing',
      path: '/billing',
      icon: FaFileInvoice,
      color: '#7C3AED'
    },
    {
      title: 'Invoices',
      path: '/invoice-history',
      icon: FaReceipt,
      color: '#0F766E'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarVariants = isMobile
    ? {
        expanded: {
          left: 0,
          width: '280px',
          transition: {
            duration: 0.3,
            ease: 'easeInOut'
          }
        },
        collapsed: {
          left: '-280px',
          width: '280px',
          transition: {
            duration: 0.3,
            ease: 'easeInOut'
          }
        }
      }
    : {
        expanded: {
          left: 0,
          width: '280px',
          transition: {
            duration: 0.3,
            ease: 'easeInOut'
          }
        },
        collapsed: {
          left: '-280px',
          width: '280px',
          transition: {
            duration: 0.3,
            ease: 'easeInOut'
          }
        }
      };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobile ? 'mobile' : 'desktop'}`}
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial="expanded"
    >
      <div className="sidebar-header">
        <motion.div
          className="sidebar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="logo-icon">Rx</span>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="logo-text"
            >
              SRI KRISHNA MEDICALS 
            </motion.span>
          )}
        </motion.div>

        <motion.button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isCollapsed ? 'Open menu' : 'Close menu'}
        >
          {isCollapsed ? <FaBars /> : <FaChevronLeft />}
        </motion.button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="nav-item-container"
          >
            <Link
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                if (isMobile && !isCollapsed) {
                  toggleSidebar();
                }
              }}
              style={{
                '--item-color': item.color,
                '--item-hover-color': `${item.color}20`
              }}
            >
              <motion.div
                className="nav-icon"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <item.icon />
              </motion.div>
              {!isCollapsed && (
                <motion.span
                  className="nav-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {item.title}
                </motion.span>
              )}
              {location.pathname === item.path && (
                <motion.div
                  className="active-indicator"
                  layoutId="sidebarActive"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <motion.button
          className="logout-button"
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSignOutAlt className="logout-icon" />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
