require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('./connection');

async function viewCharacters() {
  try {
    const [characters] = await db.query('SELECT * FROM characters');
    
    if (characters.length === 0) {
      console.log('\nNo characters found in database.\n');
    } else {
      console.log('\n=== SAVED CHARACTERS ===\n');
      characters.forEach((char, index) => {
        console.log(`${index + 1}. ${char.name}`);
        console.log(`   Race: ${char.race} | Class: ${char.class} | Level: ${char.level}`);
        console.log(`   STR: ${char.strength} DEX: ${char.dexterity} CON: ${char.constitution}`);
        console.log(`   INT: ${char.intelligence} WIS: ${char.wisdom} CHA: ${char.charisma}`);
        console.log(`   HP: ${char.hit_points} | AC: ${char.armor_class}`);
        console.log(`   Created: ${char.created_at}\n`);
      });
    }
    
    await db.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

viewCharacters();
