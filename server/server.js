const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Environment loaded. GOOGLE_API_KEY is:', process.env.GOOGLE_API_KEY ? 'SET' : 'UNDEFINED');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/campaigns', require('./routes/campaigns'));

// Socket.io connection handling
const socketHandlers = require('./services/socket-handlers');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socketHandlers.handleConnection(socket, io);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socketHandlers.handleDisconnection(socket, io);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});