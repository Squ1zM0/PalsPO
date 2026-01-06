const pool = require('../../db');

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    // Check if already blocked
    const existingBlock = await pool.query(
      'SELECT id FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
      [req.userId, userId]
    );

    if (existingBlock.rows.length > 0) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    await pool.query('BEGIN');

    try {
      // Create block
      await pool.query(
        'INSERT INTO blocks (user_id, blocked_user_id) VALUES ($1, $2)',
        [req.userId, userId]
      );

      // Update any matches to blocked state
      await pool.query(
        `UPDATE matches 
         SET consent_state = 'blocked'
         WHERE (user1_id = $1 AND user2_id = $2)
         OR (user1_id = $2 AND user2_id = $1)`,
        [req.userId, userId]
      );

      // Log the action
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`,
        [req.userId, 'block_user', JSON.stringify({ blocked_user_id: userId })]
      );

      await pool.query('COMMIT');

      res.json({ message: 'User blocked successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete block
    const result = await pool.query(
      'DELETE FROM blocks WHERE user_id = $1 AND blocked_user_id = $2 RETURNING *',
      [req.userId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blockedResult = await pool.query(
      `SELECT b.blocked_user_id, b.created_at, p.alias
       FROM blocks b
       JOIN profiles p ON b.blocked_user_id = p.user_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.userId]
    );

    res.json({ blocked: blockedResult.rows });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, context } = req.body;

    const validCategories = [
      'harassment',
      'scam',
      'sexual_content',
      'hate_speech',
      'minors',
      'spam',
      'other'
    ];

    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    if (parseInt(userId) === req.userId) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }

    // Create report
    const reportResult = await pool.query(
      `INSERT INTO reports (reporter_id, reported_id, category, context)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, userId, category, context || '']
    );

    // Log the action
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [req.userId, 'report_user', JSON.stringify({ reported_user_id: userId, category })]
    );

    res.status(201).json({
      message: 'Report submitted successfully',
      report: reportResult.rows[0]
    });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  reportUser
};
