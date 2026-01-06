const pool = require('../../db');

const createLetterEvent = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { event_type } = req.body; // 'sent' or 'received'

    if (!['sent', 'received'].includes(event_type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Verify match exists and user is part of it
    const matchResult = await pool.query(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND (user1_id = $2 OR user2_id = $2)
       AND consent_state IN ('mutual_pen_pal', 'address_requested', 'revealed')`,
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or cannot track letters' });
    }

    // Create letter event
    const eventResult = await pool.query(
      `INSERT INTO letter_events (match_id, user_id, event_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [matchId, req.userId, event_type]
    );

    res.status(201).json({
      message: 'Letter event created',
      event: eventResult.rows[0]
    });
  } catch (error) {
    console.error('Create letter event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLetterEvents = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify match exists and user is part of it
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get all letter events for this match
    const eventsResult = await pool.query(
      `SELECT le.*, p.alias as user_alias
       FROM letter_events le
       JOIN profiles p ON le.user_id = p.user_id
       WHERE le.match_id = $1
       ORDER BY le.timestamp DESC`,
      [matchId]
    );

    res.json({ events: eventsResult.rows });
  } catch (error) {
    console.error('Get letter events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateLetterEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { event_type } = req.body;

    if (!['sent', 'received'].includes(event_type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Verify event exists and user owns it
    const eventResult = await pool.query(
      'SELECT * FROM letter_events WHERE id = $1 AND user_id = $2',
      [eventId, req.userId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Letter event not found' });
    }

    // Update event
    const updateResult = await pool.query(
      'UPDATE letter_events SET event_type = $1, timestamp = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [event_type, eventId]
    );

    res.json({
      message: 'Letter event updated',
      event: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update letter event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createLetterEvent,
  getLetterEvents,
  updateLetterEvent
};
