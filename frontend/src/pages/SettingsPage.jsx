import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { safetyService } from '../services';

function SettingsPage() {
  const { user, logout } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  const loadBlockedUsers = async () => {
    setLoading(true);
    setShowBlocked(true);
    try {
      const data = await safetyService.getBlockedUsers();
      setBlockedUsers(data);
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await safetyService.unblockUser(userId);
      loadBlockedUsers();
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️ Settings</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Manage your account and preferences</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>👤 Account Information</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Email Address</p>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>📧 {user?.email || 'Not available'}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Pen Name</p>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>✉️ {user?.alias || 'Not set'}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Member Since</p>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>
                📅 {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>🛡️ Privacy & Safety</h2>
          <div style={{ marginBottom: '16px' }}>
            <button 
              onClick={loadBlockedUsers} 
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : showBlocked ? '🔄 Refresh Blocked Users' : '👁️ View Blocked Users'}
            </button>
          </div>
          
          {showBlocked && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#666' }}>Blocked Users</h3>
              {blockedUsers.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
                  <p>You haven't blocked anyone yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {blockedUsers.map((blocked) => (
                    <div 
                      key={blocked.blocked_user_id} 
                      style={{ 
                        padding: '16px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>🚫 {blocked.alias}</span>
                      <button 
                        onClick={() => handleUnblock(blocked.blocked_user_id)} 
                        className="btn btn-secondary"
                        style={{ fontSize: '14px', padding: '6px 16px' }}
                      >
                        ✅ Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid #dc3545' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>🔐 Account Actions</h2>
          <div>
            <button 
              onClick={logout} 
              className="btn btn-danger"
              style={{ padding: '12px 24px' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
