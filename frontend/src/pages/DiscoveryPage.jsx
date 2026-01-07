import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { discoveryService } from '../services';

function DiscoveryPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await discoveryService.getFeed(10, 0);
      setProfiles(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to load discovery feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    setSending(true);
    try {
      await discoveryService.sendConnectionRequest(userId);
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Discovering pen pals for you</div>
    </div>
  );

  const currentProfile = profiles[currentIndex];

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🔍 Discover Pen Pals</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Find your next writing companion</p>
        </div>

        {!currentProfile ? (
          <div className="card">
            <div className="empty-state">
              <h3>No more profiles right now</h3>
              <p>Check back later for new pen pals to discover!</p>
              <button onClick={loadProfiles} className="btn btn-primary" disabled={loading}>
                🔄 Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Profile {currentIndex + 1} of {profiles.length}
              </span>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>✉️ {currentProfile.alias}</h2>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', color: '#667eea', marginBottom: '8px' }}>💭 Interests</h3>
                {currentProfile.interests && currentProfile.interests.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentProfile.interests.map((interest, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '14px' }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999', fontSize: '14px' }}>No interests listed</p>
                )}
              </div>

              {currentProfile.writing_style && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', color: '#667eea', marginBottom: '8px' }}>✍️ Writing Style</h3>
                  <span className="badge badge-info" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                    {currentProfile.writing_style}
                  </span>
                </div>
              )}

              {currentProfile.region && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', color: '#667eea', marginBottom: '8px' }}>🌍 Region</h3>
                  <p style={{ color: '#555', fontSize: '14px' }}>{currentProfile.region}</p>
                </div>
              )}

              {currentProfile.language && (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#667eea', marginBottom: '8px' }}>🗣️ Language</h3>
                  <p style={{ color: '#555', fontSize: '14px' }}>{currentProfile.language}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={handleSkip} 
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: '16px' }}
                disabled={sending}
              >
                ⏭️ Skip
              </button>
              <button 
                onClick={() => handleConnect(currentProfile.user_id)} 
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '16px' }}
                disabled={sending}
              >
                {sending ? '⏳ Sending...' : '✉️ Send Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscoveryPage;
