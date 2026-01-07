import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            📊 Dashboard
          </Link>
          <Link to="/discovery" className={isActive('/discovery') ? 'active' : ''}>
            🔍 Discover
          </Link>
          <Link to="/matches" className={isActive('/matches') ? 'active' : ''}>
            💬 Matches
          </Link>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            👤 Profile
          </Link>
          <Link to="/address" className={isActive('/address') ? 'active' : ''}>
            📬 Address
          </Link>
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
            ⚙️ Settings
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Hi, {user?.alias || 'User'}! 👋
          </span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '14px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
