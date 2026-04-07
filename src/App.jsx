import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gray-50)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>
              Error
            </div>
            <h1 style={{ color: 'var(--gray-900)', marginBottom: 'var(--spacing-md)' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
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
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
