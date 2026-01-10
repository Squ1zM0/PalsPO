const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const discoveryRoutes = require('./routes/discovery');
const matchesRoutes = require('./routes/matches');
const messagesRoutes = require('./routes/messages');
const addressesRoutes = require('./routes/addresses');
const lettersRoutes = require('./routes/letters');
const scansRoutes = require('./routes/scans');
const safetyRoutes = require('./routes/safety');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

// Environment variable validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('CRITICAL: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Server may not function properly without these variables.');
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/letters', lettersRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'PenPal Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profiles: '/api/profiles',
      discovery: '/api/discovery',
      matches: '/api/matches',
      messages: '/api/messages',
      addresses: '/api/addresses',
      letters: '/api/letters',
      scans: '/api/scans',
      safety: '/api/safety',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      hasDatabase: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAwsConfig: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION),
      stubServicesEnabled: process.env.USE_STUB_SERVICES === 'true' || 
        !process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_REGION,
    }
  };

  // Test database connection
  try {
    const pool = require('../db');
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.databaseError = error.message;
    health.status = 'degraded';
  }

  res.json(health);
});

// Only start server when running directly (not in serverless environment)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;