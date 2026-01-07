import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { addressService } from '../services';
import { MESSAGE_AUTO_DISMISS_DELAY } from '../constants';

function AddressPage() {
  const [address, setAddress] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const data = await addressService.getMyAddress();
      setAddress(data.address);
      setFormData(data.address);
    } catch (error) {
      if (error.response?.status === 404) {
        setEditing(true);
      }
      console.error('Failed to load address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await addressService.saveAddress(formData);
      setMessage('✅ Address saved successfully!');
      setEditing(false);
      loadAddress();
      setTimeout(() => setMessage(''), MESSAGE_AUTO_DISMISS_DELAY);
    } catch (error) {
      setMessage('❌ Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading your address</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📬 Your Address</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Secure storage for physical mail exchange</p>
        </div>

        <div className="info-box" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#856404' }}>🔒 Privacy & Security</h3>
          <ul style={{ marginLeft: '20px', color: '#856404', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Your address is encrypted and stored securely</li>
            <li>It will only be shared after mutual consent with a pen pal</li>
            <li>You control when and with whom to share it</li>
            <li>You can block users anytime to hide your address</li>
          </ul>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', margin: 0 }}>Mailing Address</h2>
            {address && !editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                ✏️ Edit Address
              </button>
            )}
          </div>

          {!editing && address ? (
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '2px dashed #667eea' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Street Address</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{address.street}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>City</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{address.city}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>State/Province</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>{address.state || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Postal Code</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>{address.postal_code}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Country</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>{address.country}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  placeholder="New York"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  placeholder="United States"
                />
              </div>
              {message && (
                <div className={message.includes('success') ? 'success' : 'error'}>
                  {message}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Address'}
                </button>
                {address && (
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressPage;
