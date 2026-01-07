const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Limit to 1 connection per lambda instance to avoid connection pool exhaustion in serverless
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;