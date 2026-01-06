import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { messageService, matchService } from '../services';

function ChatPage() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [match, setMatch] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      const [matchesData, messagesData] = await Promise.all([
        matchService.getMatches(),
        messageService.getMessages(matchId)
      ]);
      const currentMatch = matchesData.find(m => m.id === parseInt(matchId));
      setMatch(currentMatch);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await messageService.getMessages(matchId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await messageService.sendMessage(matchId, newMessage);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleRequestPenPal = async () => {
    try {
      await matchService.requestPenPal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to request pen pal:', error);
    }
  };

  const handleConfirmPenPal = async () => {
    try {
      await matchService.confirmPenPal(matchId);
      loadData();
    } catch (error) {
      console.error('Failed to confirm pen pal:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1>Chat with {match?.partner_alias}</h1>
              <p>Status: {match?.consent_state.replace(/_/g, ' ')}</p>
            </div>
            <div>
              {match?.consent_state === 'chatting' && (
                <button onClick={handleRequestPenPal} className="btn btn-primary">
                  Request Pen Pal
                </button>
              )}
              {match?.consent_state === 'requested_pen_pal' && (
                <button onClick={handleConfirmPenPal} className="btn btn-primary">
                  Confirm Pen Pal
                </button>
              )}
            </div>
          </div>

          <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '10px', textAlign: msg.sender_alias === match?.partner_alias ? 'left' : 'right' }}>
                <div style={{ display: 'inline-block', maxWidth: '70%', padding: '10px', borderRadius: '8px', backgroundColor: msg.sender_alias === match?.partner_alias ? '#e9ecef' : '#4a90e2', color: msg.sender_alias === match?.partner_alias ? '#000' : '#fff' }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <small style={{ opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
