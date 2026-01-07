import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { matchService, discoveryService } from '../services';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [matches, setMatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matchesData, requestsData] = await Promise.all([
        matchService.getMatches(),
        discoveryService.getPendingRequests()
      ]);
      setMatches(matchesData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await discoveryService.respondToRequest(requestId, action);
      loadData();
    } catch (error) {
      console.error('Failed to respond to request:', error);
    }
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading your dashboard</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📊 Dashboard</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Welcome back! Here's what's happening</p>
        </div>

        {pendingRequests.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid #667eea' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>🔔 Pending Connection Requests ({pendingRequests.length})</h2>
            {pendingRequests.map((request) => (
              <div key={request.id} style={{ padding: '16px', marginBottom: '12px', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>✉️ {request.alias}</p>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                      <strong>Interests:</strong> {request.interests?.join(', ') || 'None listed'}
                    </p>
                    {request.writing_style && (
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        <strong>Writing Style:</strong> {request.writing_style}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleRequest(request.id, 'accept')}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px' }}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, 'reject')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px' }}
                    >
                      ❌ Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>💬 Your Matches ({matches.length})</h2>
          {matches.length === 0 ? (
            <div className="empty-state">
              <h3>No matches yet</h3>
              <p>Start discovering pen pals to make your first connection!</p>
              <Link to="/discovery">
                <button className="btn btn-primary">🔍 Discover Pen Pals</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {matches.map((match) => (
                <div key={match.id} style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>✉️ {match.partner_alias}</p>
                      <span className={`badge ${match.consent_state === 'revealed' ? 'badge-success' : match.consent_state === 'mutual_pen_pal' ? 'badge-primary' : 'badge-info'}`}>
                        {match.consent_state === 'chatting' ? '💬 Chatting' :
                         match.consent_state === 'requested_pen_pal' ? '📮 Pen Pal Requested' :
                         match.consent_state === 'mutual_pen_pal' ? '✨ Pen Pals' :
                         match.consent_state === 'address_requested' ? '🔐 Address Reveal Requested' :
                         match.consent_state === 'revealed' ? '🎉 Addresses Revealed' :
                         match.consent_state.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Link to={`/chat/${match.id}`}>
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                          💬 Chat
                        </button>
                      </Link>
                      {(match.consent_state === 'mutual_pen_pal' || match.consent_state === 'address_requested' || match.consent_state === 'revealed') && (
                        <Link to={`/letters/${match.id}`}>
                          <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                            📬 Letters
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
