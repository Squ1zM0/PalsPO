const pool = require('../../db');

const getProfile = async (req, res) => {
  try {
    const profileResult = await pool.query(
      `SELECT p.*, pr.discovery_filters
       FROM profiles p
       LEFT JOIN preferences pr ON p.user_id = pr.user_id
       WHERE p.user_id = $1`,
      [req.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: profileResult.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { alias, interests, writing_style, age_range, region, language } = req.body;

    const updateResult = await pool.query(
      `UPDATE profiles 
       SET alias = COALESCE($1, alias),
           interests = COALESCE($2, interests),
           writing_style = COALESCE($3, writing_style),
           age_range = COALESCE($4, age_range),
           region = COALESCE($5, region),
           language = COALESCE($6, language)
       WHERE user_id = $7
       RETURNING *`,
      [alias, JSON.stringify(interests), writing_style, age_range, region, language, req.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      profile: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { discovery_filters } = req.body;

    const updateResult = await pool.query(
      `UPDATE preferences 
       SET discovery_filters = $1
       WHERE user_id = $2
       RETURNING *`,
      [JSON.stringify(discovery_filters), req.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences
};
