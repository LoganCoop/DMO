require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // First connect without database to create it
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Create database
    console.log('Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'dmo'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'dmo'}' created or already exists`);

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME || 'dmo'}`);

    // Read and execute the schema file
    console.log('Running schema...');
    const schemaPath = path.join(__dirname, 'schema-mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Schema executed successfully');

    console.log('\n🎉 Database setup complete!');
    console.log('You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
