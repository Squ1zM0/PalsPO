import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { addressService } from '../services';

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
      setMessage('Address saved successfully!');
      setEditing(false);
      loadAddress();
    } catch (error) {
      setMessage('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Your Address</h1>
            {address && !editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Address
              </button>
            )}
          </div>

          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <p><strong>Privacy Note:</strong> Your address is stored encrypted and will only be shared with your pen pals after mutual consent.</p>
          </div>

          {!editing && address ? (
            <div>
              <p><strong>Street:</strong> {address.street}</p>
              <p><strong>City:</strong> {address.city}</p>
              <p><strong>State:</strong> {address.state}</p>
              <p><strong>Postal Code:</strong> {address.postal_code}</p>
              <p><strong>Country:</strong> {address.country}</p>
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
                  placeholder="123 Main St"
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
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
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
              {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                {address && (
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                    Cancel
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
