import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthError } from '../utils/authErrors';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      handleAuthError(err, 'Login', setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✉️ PenPal Platform
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Connect with pen pals around the world</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength="8"
            />
          </div>
          {error && <div className="error">{String(error)}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
            {loading ? '🔄 Logging in...' : '🚀 Login'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: '#666' }}>
          Don't have an account? <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
