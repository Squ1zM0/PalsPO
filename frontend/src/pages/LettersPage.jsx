import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    try {
      await letterService.createEvent(matchId, 'sent');
      loadData();
    } catch (error) {
      console.error('Failed to mark sent:', error);
    }
  };

  const handleMarkReceived = async () => {
    try {
      await letterService.createEvent(matchId, 'received');
      loadData();
    } catch (error) {
      console.error('Failed to mark received:', error);
    }
  };

  const handleRequestReveal = async () => {
    try {
      await addressService.requestReveal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to request reveal:', error);
    }
  };

  const handleConfirmReveal = async () => {
    try {
      await addressService.confirmReveal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to confirm reveal:', error);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <h1>Letters with {match?.partner_alias}</h1>

        {match?.consent_state === 'mutual_pen_pal' && (
          <div className="card">
            <h3>Address Reveal</h3>
            <p>To send physical letters, you need to exchange addresses.</p>
            <button onClick={handleRequestReveal} className="btn btn-primary">
              Request Address Reveal
            </button>
          </div>
        )}

        {match?.consent_state === 'address_requested' && (
          <div className="card">
            <h3>Address Reveal Requested</h3>
            <p>Your pen pal has requested to exchange addresses. Both addresses will be revealed simultaneously.</p>
            <button onClick={handleConfirmReveal} className="btn btn-primary">
              Confirm and Reveal Addresses
            </button>
          </div>
        )}

        {match?.consent_state === 'revealed' && partnerAddress && (
          <div className="card">
            <h3>Partner's Address</h3>
            <p>{partnerAddress.street}</p>
            <p>{partnerAddress.city}, {partnerAddress.state} {partnerAddress.postal_code}</p>
            <p>{partnerAddress.country}</p>
          </div>
        )}

        {(match?.consent_state === 'revealed' || match?.consent_state === 'mutual_pen_pal') && (
          <div className="card">
            <h3>Letter Tracking</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={handleMarkSent} className="btn btn-primary">
                Mark Letter Sent
              </button>
              <button onClick={handleMarkReceived} className="btn btn-secondary">
                Mark Letter Received
              </button>
            </div>

            <h4>Letter Timeline</h4>
            {events.length === 0 ? (
              <p>No letter events yet.</p>
            ) : (
              <div>
                {events.map((event) => (
                  <div key={event.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p><strong>{event.user_alias}</strong> {event.event_type} a letter</p>
                        <small>{new Date(event.timestamp).toLocaleString()}</small>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, event.id)}
                          style={{ display: 'none' }}
                          id={`upload-${event.id}`}
                        />
                        <label htmlFor={`upload-${event.id}`} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                          {uploadingFile === event.id ? 'Uploading...' : 'Upload Scan'}
                        </label>
                      </div>
                    </div>
                    {scans.filter(s => s.letter_event_id === event.id).map((scan) => (
                      <div key={scan.id} style={{ marginTop: '10px' }}>
                        <p>📎 Scan attached</p>
                      </div>
                    ))}
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
