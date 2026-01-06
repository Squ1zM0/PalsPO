import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { profileService } from '../services';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    alias: '',
    interests: '',
    writing_style: '',
    age_range: '',
    region: '',
    language: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        alias: data.alias || '',
        interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
        writing_style: data.writing_style || '',
        age_range: data.age_range || '',
        region: data.region || '',
        language: data.language || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updateData = {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };
      await profileService.updateProfile(updateData);
      setMessage('Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (error) {
      setMessage('Failed to update profile');
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
            <h1>Your Profile</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div>
              <p><strong>Alias:</strong> {profile?.alias}</p>
              <p><strong>Interests:</strong> {Array.isArray(profile?.interests) ? profile.interests.join(', ') : 'None'}</p>
              <p><strong>Writing Style:</strong> {profile?.writing_style || 'Not set'}</p>
              <p><strong>Age Range:</strong> {profile?.age_range || 'Not set'}</p>
              <p><strong>Region:</strong> {profile?.region || 'Not set'}</p>
              <p><strong>Language:</strong> {profile?.language || 'Not set'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Alias</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Interests (comma-separated)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="writing, travel, books"
                />
              </div>
              <div className="form-group">
                <label>Writing Style</label>
                <select
                  value={formData.writing_style}
                  onChange={(e) => setFormData({ ...formData, writing_style: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age Range</label>
                <input
                  type="text"
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  placeholder="25-35"
                />
              </div>
              <div className="form-group">
                <label>Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="United States"
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="English"
                />
              </div>
              {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
