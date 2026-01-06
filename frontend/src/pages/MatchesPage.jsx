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

  const getConsentStateDisplay = (state) => {
    const states = {
      chatting: 'Chatting',
      requested_pen_pal: 'Pen Pal Requested',
      mutual_pen_pal: 'Pen Pals',
      address_requested: 'Address Reveal Requested',
      revealed: 'Addresses Revealed'
    };
    return states[state] || state;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <h1>Your Matches</h1>

        {matches.length === 0 ? (
          <div className="card">
            <p>You don't have any matches yet.</p>
            <Link to="/discovery">
              <button className="btn btn-primary">Discover Pen Pals</button>
            </Link>
          </div>
        ) : (
          <div>
            {matches.map((match) => (
              <div key={match.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>{match.partner_alias}</h3>
                    <p>Status: <strong>{getConsentStateDisplay(match.consent_state)}</strong></p>
                    {match.partner_interests && (
                      <p>Interests: {Array.isArray(match.partner_interests) ? match.partner_interests.join(', ') : 'None'}</p>
                    )}
                  </div>
                  <div>
                    <Link to={`/chat/${match.id}`}>
                      <button className="btn btn-primary">Open Chat</button>
                    </Link>
                    {match.consent_state === 'mutual_pen_pal' && (
                      <Link to={`/letters/${match.id}`}>
                        <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                          Letters
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
  );
}

export default MatchesPage;
