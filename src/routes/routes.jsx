import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { isAuthenticated } from '../utils/localStorageManager';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MedicineList = lazy(() => import('../pages/MedicineList'));
const Customers = lazy(() => import('../pages/Customers'));
const CreateInvoice = lazy(() => import('../pages/CreateInvoice'));
const InvoiceHistory = lazy(() => import('../pages/InvoiceHistory'));
const MOBILE_QUERY = '(max-width: 960px)';

const getMatchesMobile = () => (
  typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
);

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(getMatchesMobile);
  const [isCollapsed, setIsCollapsed] = React.useState(getMatchesMobile);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => {
      setIsMobile(event.matches);
      setIsCollapsed(event.matches);
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile, location.pathname]);

  return (
    <motion.div
      className={`app-layout ${isMobile ? 'is-mobile' : 'is-desktop'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        toggleSidebar={() => setIsCollapsed((previousState) => !previousState)}
      />

      {isMobile && !isCollapsed && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          onClick={() => setIsCollapsed(true)}
          aria-label="Close sidebar"
        />
      )}

      {isCollapsed && (
        <motion.button
          className="sidebar-open-button"
          onClick={() => setIsCollapsed(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open sidebar"
        >
          <FaBars />
        </motion.button>
      )}

      <div
        className={`main-content ${
          !isMobile && !isCollapsed ? 'sidebar-open' : ''
        }`}
      >
        <div className="page-content">{children}</div>
      </div>
    </motion.div>
  );
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
        />

        <Route
          path="/login"
          element={(
            <PublicRoute>
              <Login />
            </PublicRoute>
          )}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice-history"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <motion.div
              className="not-found-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gray-50)',
                textAlign: 'center',
                padding: 'var(--spacing-xl)'
              }}
            >
              <div>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}
                >
                  404
                </motion.div>
                <h1 style={{ color: 'var(--gray-900)', marginBottom: 'var(--spacing-md)' }}>
                  Page Not Found
                </h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
                  Use dashboard, medicines, customers, billing, or invoice history from the main menu.
                </p>
                <motion.button
                  onClick={() => {
                    window.location.hash = isAuthenticated() ? '#/dashboard' : '#/login';
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {isAuthenticated() ? 'Go to Dashboard' : 'Go to Login'}
                </motion.button>
              </div>
            </motion.div>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
