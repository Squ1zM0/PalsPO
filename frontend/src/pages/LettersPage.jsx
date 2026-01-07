import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { letterService, scanService, addressService, matchService } from '../services';

function LettersPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [scans, setScans] = useState([]);
  const [partnerAddress, setPartnerAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    try {
      const [matchesData, eventsData, scansData] = await Promise.all([
        matchService.getMatches(),
        letterService.getEvents(matchId),
        scanService.getScans(matchId)
      ]);
      
      const currentMatch = matchesData.find(m => m.id === parseInt(matchId));
      setMatch(currentMatch);
      setEvents(eventsData);
      setScans(scansData);

      if (currentMatch?.consent_state === 'revealed') {
        try {
          const address = await addressService.getPartnerAddress(matchId);
          setPartnerAddress(address);
        } catch (error) {
          console.error('Failed to load partner address:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async () => {
    setActionLoading('sent');
    try {
      await letterService.createEvent(matchId, 'sent');
      loadData();
    } catch (error) {
      console.error('Failed to mark sent:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReceived = async () => {
    setActionLoading('received');
    try {
      await letterService.createEvent(matchId, 'received');
      loadData();
    } catch (error) {
      console.error('Failed to mark received:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestReveal = async () => {
    setActionLoading('request');
    try {
      await addressService.requestReveal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to request reveal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReveal = async () => {
    setActionLoading('confirm');
    try {
      await addressService.confirmReveal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to confirm reveal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFileUpload = async (e, letterEventId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(letterEventId);
    try {
      await scanService.uploadScan(file, letterEventId);
      loadData();
    } catch (error) {
      console.error('Failed to upload scan:', error);
    } finally {
      setUploadingFile(null);
    }
  };

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading letters</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link to={`/chat/${matchId}`} style={{ textDecoration: 'none', color: '#667eea' }}>
              ← Back to Chat
            </Link>
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📬 Letters with {match?.partner_alias}</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Track and manage your physical letter exchange</p>
        </div>

        {match?.consent_state === 'mutual_pen_pal' && (
          <div className="card" style={{ borderLeft: '4px solid #ffc107' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>🔐 Address Exchange Required</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              To send physical letters, you need to exchange addresses. Both addresses will be revealed simultaneously for privacy.
            </p>
            <button 
              onClick={handleRequestReveal} 
              className="btn btn-primary"
              disabled={actionLoading === 'request'}
            >
              {actionLoading === 'request' ? '⏳ Requesting...' : '🔓 Request Address Reveal'}
            </button>
          </div>
        )}

        {match?.consent_state === 'address_requested' && (
          <div className="card" style={{ borderLeft: '4px solid #667eea' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>📮 Address Reveal Pending</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Your pen pal has requested to exchange addresses. Confirming will reveal both addresses at the same time.
            </p>
            <button 
              onClick={handleConfirmReveal} 
              className="btn btn-primary"
              disabled={actionLoading === 'confirm'}
            >
              {actionLoading === 'confirm' ? '⏳ Confirming...' : '✅ Confirm and Reveal Addresses'}
            </button>
          </div>
        )}

        {match?.consent_state === 'revealed' && partnerAddress && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)', border: '2px solid #667eea' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>📬 {match?.partner_alias}'s Address</h3>
            <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>{partnerAddress.street}</p>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>
                {partnerAddress.city}{partnerAddress.state ? `, ${partnerAddress.state}` : ''} {partnerAddress.postal_code}
              </p>
              <p style={{ fontSize: '16px' }}>{partnerAddress.country}</p>
            </div>
          </div>
        )}

        {(match?.consent_state === 'revealed' || match?.consent_state === 'mutual_pen_pal' || match?.consent_state === 'address_requested') && (
          <div className="card">
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>📝 Letter Tracking</h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleMarkSent} 
                className="btn btn-primary"
                disabled={actionLoading === 'sent'}
              >
                {actionLoading === 'sent' ? '⏳ Saving...' : '📮 Mark Letter Sent'}
              </button>
              <button 
                onClick={handleMarkReceived} 
                className="btn btn-secondary"
                disabled={actionLoading === 'received'}
              >
                {actionLoading === 'received' ? '⏳ Saving...' : '📬 Mark Letter Received'}
              </button>
            </div>

            <h4 style={{ fontSize: '18px', marginBottom: '16px', color: '#667eea' }}>Timeline</h4>
            {events.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p style={{ color: '#999' }}>No letter events yet. Start by sending your first letter!</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '30px' }}>
                <div style={{ position: 'absolute', left: '12px', top: '0', bottom: '0', width: '2px', background: '#e9ecef' }} />
                {events.map((event, idx) => (
                  <div key={event.id} style={{ marginBottom: '24px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-18px', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: event.event_type === 'sent' ? '#667eea' : '#28a745',
                      border: '3px solid white',
                      boxShadow: '0 0 0 2px #e9ecef'
                    }} />
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                            {event.event_type === 'sent' ? '📮' : '📬'} {event.user_alias} {event.event_type} a letter
                          </p>
                          <small style={{ color: '#666' }}>
                            {new Date(event.timestamp).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, event.id)}
                            style={{ display: 'none' }}
                            id={`upload-${event.id}`}
                          />
                          <label htmlFor={`upload-${event.id}`}>
                            <button 
                              type="button"
                              className="btn btn-secondary" 
                              style={{ cursor: 'pointer', fontSize: '14px', padding: '6px 12px' }}
                              onClick={() => document.getElementById(`upload-${event.id}`).click()}
                              disabled={uploadingFile === event.id}
                            >
                              {uploadingFile === event.id ? '⏳ Uploading...' : '📎 Upload Scan'}
                            </button>
                          </label>
                        </div>
                      </div>
                      {scans.filter(s => s.letter_event_id === event.id).map((scan) => (
                        <div key={scan.id} style={{ 
                          marginTop: '12px', 
                          padding: '8px 12px', 
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}>
                          <p style={{ fontSize: '14px', color: '#667eea' }}>📎 Scan attached</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LettersPage;
