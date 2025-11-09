const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Generate a unique 6-character room code
function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Auto-close empty rooms after 30 minutes of inactivity
setInterval(async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Find rooms with no participants that haven't been updated in 30 minutes
    const [emptyRooms] = await db.query(`
      SELECT r.id, r.name, r.code 
      FROM rooms r
      LEFT JOIN room_participants rp ON r.id = rp.room_id
      WHERE r.is_active = true 
        AND r.created_at < $1
        AND rp.id IS NULL
    `, [thirtyMinutesAgo]);
    
    if (emptyRooms.length > 0) {
      const roomIds = emptyRooms.map(r => r.id);
      await db.query('UPDATE rooms SET is_active = false WHERE id = ANY($1)', [roomIds]);
      console.log(`Auto-closed ${emptyRooms.length} empty rooms:`, emptyRooms.map(r => r.code).join(', '));
    }
  } catch (error) {
    console.error('Error auto-closing empty rooms:', error);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Get all active rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as player_count
      FROM rooms r 
      WHERE r.is_active = true 
      ORDER BY r.created_at DESC
    `);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Debug: Get all room participants
router.get('/debug/all-participants', async (req, res) => {
  try {
    const [participants] = await db.query('SELECT * FROM room_participants');
    const [rooms] = await db.query('SELECT id, name, code, is_active FROM rooms');
    res.json({ participants, rooms });
  } catch (error) {
    console.error('Error fetching debug data:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

// Get a specific room by code
router.get('/code/:code', async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as player_count
      FROM rooms r 
      WHERE r.code = $1 AND r.is_active = true
    `, [req.params.code.toUpperCase()]);
    
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Get participants
    const [participants] = await db.query(`
      SELECT rp.*, c.name as character_name, c.class, c.race, c.level
      FROM room_participants rp
      LEFT JOIN characters c ON rp.character_id = c.id
      WHERE rp.room_id = $1
    `, [rooms[0].id]);
    
    res.json({ ...rooms[0], participants });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Check if a character is in an active room
router.get('/check/:character_id', async (req, res) => {
  try {
    const [participants] = await db.query(`
      SELECT r.* 
      FROM rooms r
      INNER JOIN room_participants rp ON r.id = rp.room_id
      WHERE rp.character_id = $1 AND r.is_active = true
      LIMIT 1
    `, [req.params.character_id]);
    
    if (participants.length > 0) {
      res.json(participants[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error checking room:', error);
    res.status(500).json({ error: 'Failed to check room' });
  }
});

// Get a specific room by ID
router.get('/:id', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Get participants
    const [participants] = await db.query(`
      SELECT rp.*, c.name as character_name, c.class, c.race, c.level
      FROM room_participants rp
      LEFT JOIN characters c ON rp.character_id = c.id
      WHERE rp.room_id = $1
    `, [req.params.id]);
    
    res.json({ ...rooms[0], participants });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { name, max_players, creator_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    // Generate unique room code
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const [existing] = await db.query('SELECT id FROM rooms WHERE code = $1', [code]);
      if (existing.length === 0) break;
      code = generateRoomCode();
      attempts++;
    }

    const [result] = await db.query(
      'INSERT INTO rooms (code, name, max_players, creator_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, name, max_players || 6, creator_id || null]
    );

    const newRoom = result[0];
    
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Kick a player from room (requires vote)
router.post('/:id/kick', async (req, res) => {
  try {
    const { character_id, voter_character_id } = req.body;
    const roomId = req.params.id;

    // Get total participants
    const [participants] = await db.query(
      'SELECT COUNT(*) as count FROM room_participants WHERE room_id = $1',
      [roomId]
    );
    const totalPlayers = participants[0].count;
    
    // Check if vote already exists
    const [existingVote] = await db.query(
      'SELECT vote_count FROM kick_votes WHERE room_id = $1 AND target_character_id = $2',
      [roomId, character_id]
    );
    
    if (existingVote.length > 0) {
      const newVoteCount = existingVote[0].vote_count + 1;
      const votesNeeded = Math.ceil(totalPlayers / 2);
      
      if (newVoteCount >= votesNeeded) {
        // Kick the player
        await db.query(
          'DELETE FROM room_participants WHERE room_id = $1 AND character_id = $2',
          [roomId, character_id]
        );
        await db.query(
          'DELETE FROM kick_votes WHERE room_id = $1 AND target_character_id = $2',
          [roomId, character_id]
        );
        res.json({ message: 'Player kicked', kicked: true });
      } else {
        await db.query(
          'UPDATE kick_votes SET vote_count = $1 WHERE room_id = $2 AND target_character_id = $3',
          [newVoteCount, roomId, character_id]
        );
        res.json({ message: 'Vote recorded', votes: newVoteCount, needed: votesNeeded });
      }
    } else {
      // Create new vote
      await db.query(
        'INSERT INTO kick_votes (room_id, target_character_id, vote_count) VALUES ($1, $2, 1)',
        [roomId, character_id]
      );
      const votesNeeded = Math.ceil(totalPlayers / 2);
      res.json({ message: 'Vote recorded', votes: 1, needed: votesNeeded });
    }
  } catch (error) {
    console.error('Error processing kick vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Join a room
router.post('/:id/join', async (req, res) => {
  try {
    const { character_id } = req.body;
    const roomId = req.params.id;

    if (!character_id) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    // Check if room exists and is active
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = $1 AND is_active = true', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found or inactive' });
    }

    const room = rooms[0];

    // Check if room is full
    const [participants] = await db.query('SELECT COUNT(*) as count FROM room_participants WHERE room_id = $1', [roomId]);
    if (participants[0].count >= room.max_players) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Check if character is already in the room
    const [existing] = await db.query('SELECT id FROM room_participants WHERE room_id = $1 AND character_id = $2', [roomId, character_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Character already in room' });
    }

    // Add participant
    await db.query(
      'INSERT INTO room_participants (room_id, character_id) VALUES ($1, $2)',
      [roomId, character_id]
    );

    res.json({ message: 'Joined room successfully', room });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Leave a room
router.post('/:id/leave', async (req, res) => {
  try {
    const { character_id } = req.body;
    const roomId = req.params.id;

    console.log(`Attempting to remove character ${character_id} from room ${roomId}`);

    const [result] = await db.query(
      'DELETE FROM room_participants WHERE room_id = $1 AND character_id = $2',
      [roomId, character_id]
    );

    console.log(`Delete result:`, result);
    console.log(`Rows affected: ${result.length}`);

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Start the game (only creator can do this)
router.post('/:id/start', async (req, res) => {
  try {
    const { user_id } = req.body;
    const roomId = req.params.id;

    // Check if user is the creator
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (rooms[0].creator_id !== user_id) {
      return res.status(403).json({ error: 'Only the room creator can start the game' });
    }

    // Update room to started
    await db.query('UPDATE rooms SET is_started = true WHERE id = $1', [roomId]);
    res.json({ message: 'Game started successfully' });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Close/delete a room
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE rooms SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Room closed successfully' });
  } catch (error) {
    console.error('Error closing room:', error);
    res.status(500).json({ error: 'Failed to close room' });
  }
});

module.exports = router;