require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addCharacterStats() {
  console.log('Connecting to PostgreSQL database...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Connected successfully');

    console.log('Adding character stat columns...');
    
    const columns = [
      'strength INTEGER DEFAULT 10',
      'dexterity INTEGER DEFAULT 10',
      'constitution INTEGER DEFAULT 10',
      'intelligence INTEGER DEFAULT 10',
      'wisdom INTEGER DEFAULT 10',
      'charisma INTEGER DEFAULT 10',
      'hit_points INTEGER DEFAULT 10',
      'max_hit_points INTEGER DEFAULT 10',
      'armor_class INTEGER DEFAULT 10'
    ];

    for (const column of columns) {
      const columnName = column.split(' ')[0];
      try {
        // Check if column exists
        const checkQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='characters' AND column_name='${columnName}'
        `;
        const result = await pool.query(checkQuery);
        
        if (result.rows.length === 0) {
          // Column doesn't exist, add it
          await pool.query(`ALTER TABLE characters ADD COLUMN ${column}`);
          console.log(`✓ Added column: ${columnName}`);
        } else {
          console.log(`- Column already exists: ${columnName}`);
        }
      } catch (error) {
        console.error(`Error adding column ${columnName}:`, error.message);
      }
    }

    console.log('✅ Character stats migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
    console.log('Connection closed.');
  }
}

addCharacterStats();
