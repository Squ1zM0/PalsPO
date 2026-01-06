const pool = require('../../db');

const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is part of match
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let query;
    let params;

    if (before) {
      query = `SELECT m.*, p.alias as sender_alias
               FROM messages m
               JOIN profiles p ON m.sender_id = p.user_id
               WHERE m.match_id = $1 AND m.timestamp < $2
               ORDER BY m.timestamp DESC
               LIMIT $3`;
      params = [matchId, before, limit];
    } else {
      query = `SELECT m.*, p.alias as sender_alias
               FROM messages m
               JOIN profiles p ON m.sender_id = p.user_id
               WHERE m.match_id = $1
               ORDER BY m.timestamp DESC
               LIMIT $2`;
      params = [matchId, limit];
    }

    const messagesResult = await pool.query(query, params);

    res.json({ messages: messagesResult.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of match and match is not blocked/ended
    const matchResult = await pool.query(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND (user1_id = $2 OR user2_id = $2)
       AND consent_state NOT IN ('blocked', 'ended')`,
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or cannot send messages' });
    }

    // Insert message
    const messageResult = await pool.query(
      `INSERT INTO messages (match_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [matchId, req.userId, content]
    );

    const message = messageResult.rows[0];

    // Get sender alias
    const profileResult = await pool.query(
      'SELECT alias FROM profiles WHERE user_id = $1',
      [req.userId]
    );

    message.sender_alias = profileResult.rows[0].alias;

    res.status(201).json({
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMessages,
  sendMessage
};
