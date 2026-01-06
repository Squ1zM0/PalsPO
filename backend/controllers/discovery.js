const pool = require('../../db');

const getDiscoveryFeed = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Get users not already connected with, not blocked, and not self
    const feedResult = await pool.query(
      `SELECT DISTINCT p.user_id, p.alias, p.interests, p.writing_style, p.age_range, p.region, p.language
       FROM profiles p
       WHERE p.user_id != $1
       AND p.user_id NOT IN (
         SELECT blocked_user_id FROM blocks WHERE user_id = $1
       )
       AND p.user_id NOT IN (
         SELECT user_id FROM blocks WHERE blocked_user_id = $1
       )
       AND p.user_id NOT IN (
         SELECT to_user_id FROM match_requests WHERE from_user_id = $1
       )
       AND p.user_id NOT IN (
         SELECT from_user_id FROM match_requests WHERE to_user_id = $1
       )
       AND p.user_id NOT IN (
         SELECT user1_id FROM matches WHERE user2_id = $1
         UNION
         SELECT user2_id FROM matches WHERE user1_id = $1
       )
       ORDER BY RANDOM()
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    res.json({ profiles: feedResult.rows });
  } catch (error) {
    console.error('Discovery feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const { toUserId } = req.params;

    // Check if already connected or request exists
    const existingRequest = await pool.query(
      `SELECT id FROM match_requests 
       WHERE (from_user_id = $1 AND to_user_id = $2)
       OR (from_user_id = $2 AND to_user_id = $1)`,
      [req.userId, toUserId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Connection request already exists' });
    }

    // Check if already matched
    const existingMatch = await pool.query(
      `SELECT id FROM matches 
       WHERE (user1_id = $1 AND user2_id = $2)
       OR (user1_id = $2 AND user2_id = $1)`,
      [req.userId, toUserId]
    );

    if (existingMatch.rows.length > 0) {
      return res.status(400).json({ error: 'Already connected' });
    }

    // Create connection request
    const requestResult = await pool.query(
      'INSERT INTO match_requests (from_user_id, to_user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, toUserId, 'pending']
    );

    res.status(201).json({
      message: 'Connection request sent',
      request: requestResult.rows[0]
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const respondToConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get the request
    const requestResult = await pool.query(
      'SELECT * FROM match_requests WHERE id = $1 AND to_user_id = $2 AND status = $3',
      [requestId, req.userId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    const request = requestResult.rows[0];

    if (action === 'reject') {
      await pool.query(
        'UPDATE match_requests SET status = $1 WHERE id = $2',
        ['rejected', requestId]
      );

      return res.json({ message: 'Connection request rejected' });
    }

    // Accept: create match and update request
    await pool.query('BEGIN');

    try {
      await pool.query(
        'UPDATE match_requests SET status = $1 WHERE id = $2',
        ['accepted', requestId]
      );

      const matchResult = await pool.query(
        'INSERT INTO matches (user1_id, user2_id, consent_state) VALUES ($1, $2, $3) RETURNING *',
        [request.from_user_id, request.to_user_id, 'chatting']
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Connection request accepted',
        match: matchResult.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Respond to connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requestsResult = await pool.query(
      `SELECT mr.*, p.alias, p.interests, p.writing_style
       FROM match_requests mr
       JOIN profiles p ON mr.from_user_id = p.user_id
       WHERE mr.to_user_id = $1 AND mr.status = 'pending'
       ORDER BY mr.created_at DESC`,
      [req.userId]
    );

    res.json({ requests: requestsResult.rows });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDiscoveryFeed,
  sendConnectionRequest,
  respondToConnectionRequest,
  getPendingRequests
};
