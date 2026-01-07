const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configure for serverless environment (Vercel)
  max: 1, // Limit connections in serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;