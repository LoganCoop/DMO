const db = require('../database/connection');

// Socket.io connection handling
const handleConnection = (socket, io) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId) => {
    socket.join(`room-${roomId}`);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Leave a room
  socket.on('leave-room', (roomId) => {
    socket.leave(`room-${roomId}`);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // Send message to room
  socket.on('send-message', async (data) => {
    const { room_id, character_name, message_type, content } = data;

    try {
      // Save message to database
      const [result] = await db.query(
        'INSERT INTO chat_messages (room_id, character_name, message_type, content) VALUES (?, ?, ?, ?)',
        [room_id, character_name, message_type, content]
      );

      // Get the saved message
      const [messages] = await db.query(
        'SELECT * FROM chat_messages WHERE id = ?',
        [result.insertId]
      );

      // Broadcast to room
      io.to(`room-${room_id}`).emit('new-message', messages[0]);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Player joined notification
  socket.on('player-joined', (data) => {
    const { room_id, characterName } = data;
    io.to(`room-${room_id}`).emit('player-joined', { characterName });
  });

  // Player left notification
  socket.on('player-left', (data) => {
    const { room_id, characterName } = data;
    io.to(`room-${room_id}`).emit('player-left', { characterName });
  });
};

// Socket.io disconnection handling
const handleDisconnection = (socket, io) => {
  console.log('User disconnected:', socket.id);
};

module.exports = {
  handleConnection,
  handleDisconnection,
};