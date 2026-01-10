const AWS = require('aws-sdk');
const multer = require('multer');
const pool = require('../../db');

// Check if we should use stub mode
const USE_STUB_SERVICES = process.env.USE_STUB_SERVICES === 'true' || 
  !process.env.AWS_ACCESS_KEY_ID || 
  !process.env.AWS_SECRET_ACCESS_KEY;

// In-memory storage for stub mode
const stubStorage = new Map();

// Configure AWS S3 (only if not in stub mode)
let s3 = null;
if (!USE_STUB_SERVICES) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const uploadScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { letterEventId } = req.body;

    if (!letterEventId) {
      return res.status(400).json({ error: 'Letter event ID is required' });
    }

    // Verify letter event exists and user has access
    const eventResult = await pool.query(
      `SELECT le.* FROM letter_events le
       JOIN matches m ON le.match_id = m.id
       WHERE le.id = $1 
       AND (m.user1_id = $2 OR m.user2_id = $2)`,
      [letterEventId, req.userId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Letter event not found' });
    }

    // Generate unique key for S3
    const timestamp = Date.now();
    const s3Key = `scans/${req.userId}/${letterEventId}/${timestamp}_${req.file.originalname}`;

    if (USE_STUB_SERVICES) {
      // Stub mode: store file in memory
      console.log('[STUB MODE] Storing scan in memory instead of S3');
      stubStorage.set(s3Key, {
        buffer: req.file.buffer,
        contentType: req.file.mimetype,
        metadata: {
          original_name: req.file.originalname,
          size: req.file.size,
          mime_type: req.file.mimetype,
          uploaded_by: req.userId
        }
      });
    } else {
      // Real mode: Upload to S3
      if (!s3) {
        return res.status(500).json({ error: 'S3 client not configured' });
      }
      
      const s3Params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };

      await s3.upload(s3Params).promise();
    }

    // Save scan asset to database
    const scanResult = await pool.query(
      `INSERT INTO scan_assets (letter_event_id, s3_key, metadata)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        letterEventId,
        s3Key,
        JSON.stringify({
          original_name: req.file.originalname,
          size: req.file.size,
          mime_type: req.file.mimetype,
          uploaded_by: req.userId
        })
      ]
    );

    res.status(201).json({
      message: 'Scan uploaded successfully',
      scan: scanResult.rows[0]
    });
  } catch (error) {
    console.error('Upload scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getScans = async (req, res) => {
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

    // Get all scans for letter events in this match
    const scansResult = await pool.query(
      `SELECT sa.*, le.event_type, le.timestamp as event_timestamp
       FROM scan_assets sa
       JOIN letter_events le ON sa.letter_event_id = le.id
       WHERE le.match_id = $1
       ORDER BY le.timestamp DESC`,
      [matchId]
    );

    res.json({ scans: scansResult.rows });
  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getScanUrl = async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan and verify access
    const scanResult = await pool.query(
      `SELECT sa.* FROM scan_assets sa
       JOIN letter_events le ON sa.letter_event_id = le.id
       JOIN matches m ON le.match_id = m.id
       WHERE sa.id = $1 
       AND (m.user1_id = $2 OR m.user2_id = $2)`,
      [scanId, req.userId]
    );

    if (scanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const scan = scanResult.rows[0];

    if (USE_STUB_SERVICES) {
      // Stub mode: return a data URL from in-memory storage
      console.log('[STUB MODE] Generating data URL from in-memory storage');
      const stubData = stubStorage.get(scan.s3_key);
      
      if (!stubData) {
        return res.status(404).json({ error: 'Scan file not found in stub storage' });
      }

      // Convert buffer to base64 data URL
      const base64 = stubData.buffer.toString('base64');
      const dataUrl = `data:${stubData.contentType};base64,${base64}`;
      
      res.json({ url: dataUrl });
    } else {
      // Real mode: Generate signed URL (valid for 1 hour)
      if (!s3) {
        return res.status(500).json({ error: 'S3 client not configured' });
      }
      
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: scan.s3_key,
        Expires: 3600
      });

      res.json({ url: signedUrl });
    }
  } catch (error) {
    console.error('Get scan URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  upload,
  uploadScan,
  getScans,
  getScanUrl
};
