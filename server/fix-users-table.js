// Script to fix the users table column name
const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

async function fixUsersTable() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  const client = await pool.connect();

  try {
    console.log('Connecting to PostgreSQL database...');
    console.log('✓ Connected successfully');

    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password';
    `);

    if (checkResult.rows.length > 0) {
      // Alter the users table to rename password to password_hash
      console.log('\nAltering users table...');
      await client.query('ALTER TABLE users RENAME COLUMN password TO password_hash;');
      console.log('✓ Column renamed successfully');
    } else {
      console.log('\n✓ Column already named password_hash');
    }

    console.log('\n✅ Users table is correct!');
  } catch (error) {
    console.error('\n❌ Error fixing users table:');
    console.error(error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUsersTable();
