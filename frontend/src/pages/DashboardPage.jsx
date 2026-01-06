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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <h1>Dashboard</h1>

        {pendingRequests.length > 0 && (
          <div className="card">
            <h2>Pending Connection Requests</h2>
            {pendingRequests.map((request) => (
              <div key={request.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <p><strong>{request.alias}</strong> wants to connect</p>
                <p>Interests: {request.interests?.join(', ') || 'None'}</p>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => handleRequest(request.id, 'accept')}
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request.id, 'reject')}
                    className="btn btn-secondary"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h2>Your Matches ({matches.length})</h2>
          {matches.length === 0 ? (
            <p>No matches yet. <Link to="/discovery">Start discovering!</Link></p>
          ) : (
            <div>
              {matches.map((match) => (
                <div key={match.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  <p><strong>{match.partner_alias}</strong></p>
                  <p>Status: {match.consent_state.replace(/_/g, ' ')}</p>
                  <Link to={`/chat/${match.id}`}>
                    <button className="btn btn-primary" style={{ marginTop: '5px' }}>
                      Open Chat
                    </button>
                  </Link>
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
