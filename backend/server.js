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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});