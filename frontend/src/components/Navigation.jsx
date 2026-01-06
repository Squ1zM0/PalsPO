import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/discovery">Discover</Link>
          <Link to="/matches">My Matches</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/address">Address</Link>
          <Link to="/settings">Settings</Link>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Hello, {user?.alias}!</span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '5px 15px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
