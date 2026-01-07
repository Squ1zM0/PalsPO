import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MIN_PASSWORD_LENGTH } from '../constants';
import { handleAuthError } from '../utils/authErrors';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    
    setLoading(true);

    try {
      await register(email, password, alias);
      navigate('/profile', { replace: true });
    } catch (err) {
      handleAuthError(err, 'Registration', setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✉️ Join PenPal
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Start your pen pal journey today</p>
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
            <label>Pen Name (Alias)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              placeholder="Your creative pen name"
              autoComplete="username"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>This is how other pen pals will know you</small>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength="8"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Must be at least 8 characters long</small>
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
            {loading ? '🔄 Creating account...' : '✨ Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
