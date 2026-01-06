import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { discoveryService } from '../services';

function DiscoveryPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await discoveryService.getFeed(10, 0);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load discovery feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await discoveryService.sendConnectionRequest(userId);
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) return <div>Loading...</div>;

  const currentProfile = profiles[currentIndex];

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <h1>Discover Pen Pals</h1>

        {!currentProfile ? (
          <div className="card">
            <p>No more profiles to discover right now. Check back later!</p>
            <button onClick={loadProfiles} className="btn btn-primary">
              Refresh
            </button>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>{currentProfile.alias}</h2>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Interests:</strong></p>
              <p>{Array.isArray(currentProfile.interests) ? currentProfile.interests.join(', ') : 'None listed'}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Writing Style:</strong> {currentProfile.writing_style || 'Not specified'}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Region:</strong> {currentProfile.region || 'Not specified'}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Language:</strong> {currentProfile.language || 'Not specified'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleSkip} className="btn btn-secondary">
                Skip
              </button>
              <button onClick={() => handleConnect(currentProfile.user_id)} className="btn btn-primary">
                Send Connection Request
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
              Profile {currentIndex + 1} of {profiles.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscoveryPage;
