// Script to set up PostgreSQL database schema on Render
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the database URL from .env
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env file');
  process.exit(1);
}

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✓ Connected successfully');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema-postgresql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('\nExecuting schema...');
    await client.query(schema);
    console.log('✓ Schema executed successfully');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n✓ Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
