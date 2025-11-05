// Support both MySQL (local) and PostgreSQL (production)
let pool;

if (process.env.DATABASE_URL) {
  // Production: PostgreSQL (Render)
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Wrapper to match mysql2 API
  const originalQuery = pool.query.bind(pool);
  pool.query = async function(...args) {
    const result = await originalQuery(...args);
    return [result.rows, result.fields];
  };

  pool.query('SELECT NOW()')
    .then(() => console.log('✅ PostgreSQL database connected successfully'))
    .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

} else {
  // Development: MySQL (local)
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dmo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pool.getConnection()
    .then(connection => {
      console.log('✅ MySQL database connected successfully');
      connection.release();
    })
    .catch(err => console.error('❌ MySQL connection error:', err.message));
}

module.exports = pool;
