import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>😔</h1>
            <h2 style={{ marginBottom: '16px', color: '#dc3545' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              🔄 Refresh Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }} 
              className="btn btn-secondary"
            >
              🔐 Return to Login
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#667eea', fontWeight: '600' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#dc3545'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
