// PostgreSQL database connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Wrapper to match mysql2 API format [rows, fields]
const originalQuery = pool.query.bind(pool);
pool.query = async function(...args) {
  const result = await originalQuery(...args);
  return [result.rows, result.fields];
};

// Test connection
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL database connected successfully'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = pool;
