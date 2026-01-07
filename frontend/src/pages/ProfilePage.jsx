import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { profileService } from '../services';
import { MESSAGE_AUTO_DISMISS_DELAY } from '../constants';

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
      setMessage('✅ Profile updated successfully!');
      setEditing(false);
      loadProfile();
      setTimeout(() => setMessage(''), MESSAGE_AUTO_DISMISS_DELAY);
    } catch (error) {
      setMessage('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading your profile</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>👤 Your Profile</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Manage your pen pal identity</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', margin: 0 }}>Profile Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Pen Name</p>
                <p style={{ fontSize: '18px', fontWeight: '600' }}>✉️ {profile?.alias}</p>
              </div>
              
              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Interests</p>
                {profile?.interests && profile.interests.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.interests.map((interest, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>No interests added yet</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Writing Style</p>
                  <p style={{ fontSize: '16px', fontWeight: '500', textTransform: 'capitalize' }}>
                    ✍️ {profile?.writing_style || 'Not set'}
                  </p>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Age Range</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>
                    🎂 {profile?.age_range || 'Not set'}
                  </p>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Region</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>
                    🌍 {profile?.region || 'Not set'}
                  </p>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Language</p>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>
                    🗣️ {profile?.language || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pen Name (Alias)</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  required
                  placeholder="Your creative pen name"
                />
              </div>
              <div className="form-group">
                <label>Interests (comma-separated)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="writing, travel, books, art, music"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Separate multiple interests with commas</small>
              </div>
              <div className="form-group">
                <label>Writing Style</label>
                <select
                  value={formData.writing_style}
                  onChange={(e) => setFormData({ ...formData, writing_style: e.target.value })}
                >
                  <option value="">Select a style...</option>
                  <option value="casual">Casual - Friendly and relaxed</option>
                  <option value="formal">Formal - Professional and structured</option>
                  <option value="creative">Creative - Artistic and expressive</option>
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
                  placeholder="United States, Europe, Asia, etc."
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="English, Spanish, French, etc."
                />
              </div>
              {message && (
                <div className={message.includes('success') ? 'success' : 'error'}>
                  {message}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  ❌ Cancel
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
