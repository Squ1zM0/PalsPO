const crypto = require('crypto');
const pool = require('../../db');

const ENCRYPTION_KEY = process.env.ADDRESS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

const decrypt = (encryptedData) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

const saveAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.street || !address.city || !address.postal_code || !address.country) {
      return res.status(400).json({ error: 'Complete address required' });
    }

    const addressString = JSON.stringify(address);
    const encryptedData = encrypt(addressString);

    // Store encrypted address
    const result = await pool.query(
      `INSERT INTO addresses (user_id, encrypted_address)
       VALUES ($1, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET encrypted_address = $2, created_at = CURRENT_TIMESTAMP
       RETURNING id, created_at`,
      [req.userId, JSON.stringify(encryptedData)]
    );

    res.json({
      message: 'Address saved successfully',
      addressId: result.rows[0].id
    });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requestAddressReveal = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify match exists and user is part of it
    const matchResult = await pool.query(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND (user1_id = $2 OR user2_id = $2)
       AND consent_state = 'mutual_pen_pal'`,
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or not at pen pal stage' });
    }

    // Update consent state to address_requested
    const updateResult = await pool.query(
      'UPDATE matches SET consent_state = $1 WHERE id = $2 RETURNING *',
      ['address_requested', matchId]
    );

    res.json({
      message: 'Address reveal requested',
      match: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Request address reveal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const confirmAddressReveal = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify match exists and user is part of it
    const matchResult = await pool.query(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND (user1_id = $2 OR user2_id = $2)
       AND consent_state = 'address_requested'`,
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or address not requested' });
    }

    const match = matchResult.rows[0];

    // Check both users have addresses saved
    const addressesResult = await pool.query(
      'SELECT user_id FROM addresses WHERE user_id IN ($1, $2)',
      [match.user1_id, match.user2_id]
    );

    if (addressesResult.rows.length < 2) {
      return res.status(400).json({ error: 'Both users must save their addresses first' });
    }

    await pool.query('BEGIN');

    try {
      // Update consent state to revealed
      await pool.query(
        'UPDATE matches SET consent_state = $1 WHERE id = $2',
        ['revealed', matchId]
      );

      // Log the reveal in audit log
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3), ($4, $5, $6)`,
        [
          match.user1_id,
          'address_reveal',
          JSON.stringify({ match_id: matchId, partner_id: match.user2_id }),
          match.user2_id,
          'address_reveal',
          JSON.stringify({ match_id: matchId, partner_id: match.user1_id })
        ]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Addresses revealed',
        match: { id: matchId, consent_state: 'revealed' }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Confirm address reveal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPartnerAddress = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify match exists, user is part of it, and addresses are revealed
    const matchResult = await pool.query(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND (user1_id = $2 OR user2_id = $2)
       AND consent_state = 'revealed'`,
      [matchId, req.userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(403).json({ error: 'Address not available' });
    }

    const match = matchResult.rows[0];
    const partnerId = match.user1_id === req.userId ? match.user2_id : match.user1_id;

    // Check if blocked
    const blockResult = await pool.query(
      'SELECT id FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
      [partnerId, req.userId]
    );

    if (blockResult.rows.length > 0) {
      return res.status(403).json({ error: 'Address not available' });
    }

    // Get partner's encrypted address
    const addressResult = await pool.query(
      'SELECT encrypted_address FROM addresses WHERE user_id = $1',
      [partnerId]
    );

    if (addressResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partner address not found' });
    }

    const encryptedData = JSON.parse(addressResult.rows[0].encrypted_address);
    const decryptedAddress = decrypt(encryptedData);

    res.json({
      address: JSON.parse(decryptedAddress)
    });
  } catch (error) {
    console.error('Get partner address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyAddress = async (req, res) => {
  try {
    // Get user's own encrypted address
    const addressResult = await pool.query(
      'SELECT encrypted_address, created_at FROM addresses WHERE user_id = $1',
      [req.userId]
    );

    if (addressResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const encryptedData = JSON.parse(addressResult.rows[0].encrypted_address);
    const decryptedAddress = decrypt(encryptedData);

    res.json({
      address: JSON.parse(decryptedAddress),
      created_at: addressResult.rows[0].created_at
    });
  } catch (error) {
    console.error('Get my address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  saveAddress,
  requestAddressReveal,
  confirmAddressReveal,
  getPartnerAddress,
  getMyAddress
};
