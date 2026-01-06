const pool = require('../../db');

const getMatches = async (req, res) => {
  try {
    const matchesResult = await pool.query(
      `SELECT m.*, 
              CASE 
                WHEN m.user1_id = $1 THEN p2.alias
                ELSE p1.alias
              END as partner_alias,
              CASE 
                WHEN m.user1_id = $1 THEN p2.interests
                ELSE p1.interests
              END as partner_interests,
              CASE 
                WHEN m.user1_id = $1 THEN m.user2_id
                ELSE m.user1_id
              END as partner_id
       FROM matches m
       JOIN profiles p1 ON m.user1_id = p1.user_id
       JOIN profiles p2 ON m.user2_id = p2.user_id
       WHERE (m.user1_id = $1 OR m.user2_id = $1)
       AND m.consent_state != 'ended'
       AND m.consent_state != 'blocked'
       ORDER BY m.id DESC`,
      [req.userId]
    );

    res.json({ matches: matchesResult.rows });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requestPenPal = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match and verify user is part of it
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResult.rows[0];

    if (match.consent_state !== 'chatting') {
      return res.status(400).json({ error: 'Invalid consent state for this action' });
    }

    // Update to requested state
    const updateResult = await pool.query(
      'UPDATE matches SET consent_state = $1 WHERE id = $2 RETURNING *',
      ['requested_pen_pal', matchId]
    );

    res.json({
      message: 'Pen pal request sent',
      match: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Request pen pal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const confirmPenPal = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match and verify user is part of it
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResult.rows[0];

    if (match.consent_state !== 'requested_pen_pal') {
      return res.status(400).json({ error: 'Invalid consent state for this action' });
    }

    // Update to mutual pen pal state
    const updateResult = await pool.query(
      'UPDATE matches SET consent_state = $1 WHERE id = $2 RETURNING *',
      ['mutual_pen_pal', matchId]
    );

    res.json({
      message: 'Pen pal confirmed',
      match: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Confirm pen pal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const endMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match and verify user is part of it
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Update to ended state
    const updateResult = await pool.query(
      'UPDATE matches SET consent_state = $1 WHERE id = $2 RETURNING *',
      ['ended', matchId]
    );

    res.json({
      message: 'Match ended',
      match: updateResult.rows[0]
    });
  } catch (error) {
    console.error('End match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMatches,
  requestPenPal,
  confirmPenPal,
  endMatch
};
