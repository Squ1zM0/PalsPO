import React from 'react';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '16px' }}>🔄 {message}</h2>
        <p style={{ color: '#666' }}>Checking your authentication status</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
