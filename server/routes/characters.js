const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticateToken } = require('./auth');

// Get all characters for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [characters] = await db.query(
      'SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get a specific character by ID
router.get('/:id', async (req, res) => {
  try {
    const [characters] = await db.query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
    
    if (characters.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(characters[0]);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create a new character
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      race,
      class: charClass,
      level,
      background,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      hitPoints,
      armorClass
    } = req.body;

    // Validation
    if (!name || !race || !charClass) {
      return res.status(400).json({ error: 'Name, race, and class are required' });
    }

    const [result] = await db.query(
      `INSERT INTO characters 
      (user_id, name, race, class, level, background, strength, dexterity, constitution, 
       intelligence, wisdom, charisma, hit_points, max_hit_points, armor_class) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, race, charClass, level || 1, background, 
       strength || 10, dexterity || 10, constitution || 10,
       intelligence || 10, wisdom || 10, charisma || 10,
       hitPoints || 10, hitPoints || 10, armorClass || 10]
    );

    const [newCharacter] = await db.query('SELECT * FROM characters WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newCharacter[0]);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update a character
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'name', 'race', 'class', 'level', 'background',
      'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
      'hit_points', 'max_hit_points', 'armor_class', 'experience_points', 'notes'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    await db.query(
      `UPDATE characters SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedCharacter] = await db.query('SELECT * FROM characters WHERE id = ?', [id]);
    res.json(updatedCharacter[0]);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete a character
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM characters WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

module.exports = router;