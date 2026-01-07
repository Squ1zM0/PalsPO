import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { matchService } from '../services';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConsentBadge = (state) => {
    const badges = {
      chatting: { emoji: '💬', text: 'Chatting', class: 'badge-info' },
      requested_pen_pal: { emoji: '📮', text: 'Pen Pal Requested', class: 'badge-warning' },
      mutual_pen_pal: { emoji: '✨', text: 'Pen Pals', class: 'badge-primary' },
      address_requested: { emoji: '🔐', text: 'Address Reveal Requested', class: 'badge-warning' },
      revealed: { emoji: '🎉', text: 'Addresses Revealed', class: 'badge-success' }
    };
    return badges[state] || { emoji: '❓', text: state, class: 'badge-info' };
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading your matches</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>💬 Your Matches</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {matches.length === 0 ? 'No matches yet' : `You have ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <h3>No matches yet</h3>
              <p>Start discovering pen pals to make your first connection!</p>
              <Link to="/discovery">
                <button className="btn btn-primary">🔍 Discover Pen Pals</button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {matches.map((match) => {
              const badge = getConsentBadge(match.consent_state);
              return (
                <div key={match.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>✉️ {match.partner_alias}</h3>
                      <span className={`badge ${badge.class}`} style={{ marginBottom: '12px' }}>
                        {badge.emoji} {badge.text}
                      </span>
                      {match.partner_interests && match.partner_interests.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            <strong>Interests:</strong>
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {match.partner_interests.map((interest, idx) => (
                              <span key={idx} className="badge badge-info" style={{ fontSize: '12px' }}>
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Link to={`/chat/${match.id}`}>
                        <button className="btn btn-primary">💬 Chat</button>
                      </Link>
                      {(match.consent_state === 'mutual_pen_pal' || 
                        match.consent_state === 'address_requested' || 
                        match.consent_state === 'revealed') && (
                        <Link to={`/letters/${match.id}`}>
                          <button className="btn btn-secondary">📬 Letters</button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchesPage;
