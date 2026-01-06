const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = adminResult.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with admin flag
    const token = jwt.sign(
      { userId: admin.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;

    const reportsResult = await pool.query(
      `SELECT r.*, 
              p1.alias as reporter_alias,
              p2.alias as reported_alias
       FROM reports r
       JOIN profiles p1 ON r.reporter_id = p1.user_id
       JOIN profiles p2 ON r.reported_id = p2.user_id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ reports: reportsResult.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Get report with user details
    const reportResult = await pool.query(
      `SELECT r.*, 
              p1.alias as reporter_alias, p1.user_id as reporter_user_id,
              p2.alias as reported_alias, p2.user_id as reported_user_id
       FROM reports r
       JOIN profiles p1 ON r.reporter_id = p1.user_id
       JOIN profiles p2 ON r.reported_id = p2.user_id
       WHERE r.id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = reportResult.rows[0];

    // Get recent messages between the two users
    const messagesResult = await pool.query(
      `SELECT m.*, p.alias as sender_alias
       FROM messages m
       JOIN matches ma ON m.match_id = ma.id
       JOIN profiles p ON m.sender_id = p.user_id
       WHERE ((ma.user1_id = $1 AND ma.user2_id = $2)
           OR (ma.user1_id = $2 AND ma.user2_id = $1))
       ORDER BY m.timestamp DESC
       LIMIT 20`,
      [report.reporter_user_id, report.reported_user_id]
    );

    res.json({
      report,
      recent_messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Get report details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const takeAction = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // 'warn', 'suspend', 'ban'

    if (!['warn', 'suspend', 'ban'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await pool.query('BEGIN');

    try {
      // Log the admin action
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`,
        [
          userId,
          `admin_${action}`,
          JSON.stringify({ reason, admin_id: req.userId, timestamp: new Date() })
        ]
      );

      // For suspend or ban, update user status (you may want to add a status field to users table)
      if (action === 'suspend' || action === 'ban') {
        // This would require adding a status field to the users table
        // For now, we'll just log it
      }

      await pool.query('COMMIT');

      res.json({
        message: `Action ${action} taken successfully`,
        action,
        userId
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Take action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.query;

    let query;
    let params;

    if (userId) {
      query = `SELECT al.*, p.alias
               FROM audit_logs al
               LEFT JOIN profiles p ON al.user_id = p.user_id
               WHERE al.user_id = $1
               ORDER BY al.timestamp DESC
               LIMIT $2 OFFSET $3`;
      params = [userId, limit, offset];
    } else {
      query = `SELECT al.*, p.alias
               FROM audit_logs al
               LEFT JOIN profiles p ON al.user_id = p.user_id
               ORDER BY al.timestamp DESC
               LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const logsResult = await pool.query(query, params);

    res.json({ logs: logsResult.rows });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  getReports,
  getReportDetails,
  takeAction,
  getAuditLogs
};
