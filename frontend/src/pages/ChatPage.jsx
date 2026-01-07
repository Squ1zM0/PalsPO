import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { messageService, matchService } from '../services';
import { MESSAGE_POLL_INTERVAL } from '../constants';

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
    const interval = setInterval(loadMessages, MESSAGE_POLL_INTERVAL);
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

  if (loading) return (
    <div className="page">
      <Navigation />
      <div className="loading">Loading chat</div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>💬 Chat with {match?.partner_alias}</h1>
              <span className={`badge ${match?.consent_state === 'revealed' ? 'badge-success' : match?.consent_state === 'mutual_pen_pal' ? 'badge-primary' : 'badge-info'}`}>
                {match?.consent_state === 'chatting' ? '💬 Chatting' :
                 match?.consent_state === 'requested_pen_pal' ? '📮 Pen Pal Requested' :
                 match?.consent_state === 'mutual_pen_pal' ? '✨ Pen Pals' :
                 match?.consent_state === 'address_requested' ? '🔐 Address Reveal Requested' :
                 match?.consent_state === 'revealed' ? '🎉 Addresses Revealed' :
                 match?.consent_state?.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {match?.consent_state === 'chatting' && (
                <button onClick={handleRequestPenPal} className="btn btn-primary">
                  ✨ Request Pen Pal
                </button>
              )}
              {match?.consent_state === 'requested_pen_pal' && (
                <button onClick={handleConfirmPenPal} className="btn btn-primary">
                  ✅ Confirm Pen Pal
                </button>
              )}
              {(match?.consent_state === 'mutual_pen_pal' || match?.consent_state === 'address_requested' || match?.consent_state === 'revealed') && (
                <Link to={`/letters/${matchId}`}>
                  <button className="btn btn-secondary">📬 View Letters</button>
                </Link>
              )}
            </div>
          </div>

          <div style={{ 
            height: '500px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa',
            border: '2px solid #e9ecef', 
            padding: '20px', 
            marginBottom: '20px', 
            borderRadius: '12px',
            backgroundImage: 'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <p style={{ color: '#999' }}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_alias !== match?.partner_alias;
                return (
                  <div key={msg.id} style={{ 
                    marginBottom: '16px', 
                    textAlign: isOwn ? 'right' : 'left',
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{ 
                      display: 'inline-block', 
                      maxWidth: '70%', 
                      padding: '12px 16px', 
                      borderRadius: '16px',
                      background: isOwn 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: isOwn ? 'white' : '#333',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      wordBreak: 'break-word'
                    }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '15px', lineHeight: '1.4' }}>{msg.content}</p>
                      <small style={{ opacity: 0.8, fontSize: '12px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ 
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '2px solid #e9ecef',
                fontSize: '15px'
              }}
              disabled={sending}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={sending || !newMessage.trim()}
              style={{ borderRadius: '24px', padding: '12px 24px' }}
            >
              {sending ? '⏳' : '📮 Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
