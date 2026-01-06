import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { safetyService } from '../services';

function SettingsPage() {
  const { user, logout } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBlockedUsers = async () => {
    setLoading(true);
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
        <h1>Settings</h1>

        <div className="card">
          <h2>Account Information</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Alias:</strong> {user?.alias}</p>
          <p><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="card">
          <h2>Privacy & Safety</h2>
          <div>
            <button onClick={loadBlockedUsers} className="btn btn-secondary">
              {loading ? 'Loading...' : 'View Blocked Users'}
            </button>
          </div>
          
          {blockedUsers.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Blocked Users</h3>
              {blockedUsers.map((blocked) => (
                <div key={blocked.blocked_user_id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{blocked.alias}</span>
                  <button onClick={() => handleUnblock(blocked.blocked_user_id)} className="btn btn-secondary">
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Account Actions</h2>
          <button onClick={logout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
