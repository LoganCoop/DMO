# Dungeon Master Online (DMO) - Getting Started

## Project Structure
```
DMO/
├── client/          # React/Next.js frontend
├── server/          # Node.js/Express backend  
├── database/        # Database schema and migrations
└── docs/           # Documentation
```

## Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis (optional, for session management)
- VS Code Insiders

## Quick Start

### 1. Set up the database
```sql
-- Create database
CREATE DATABASE dmo_db;

-- Run the schema
psql -d dmo_db -f server/database/schema.sql
```

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Set up the client
```bash
cd client  
npm install
npm run dev
```

### 4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Key Features to Implement

### Phase 1: Core Foundation
1. **User Authentication**
   - Registration/Login system
   - JWT token management
   - User profiles

2. **Character Management** 
   - Character creation form
   - Stats calculation (D&D 5e rules)
   - Character sheet display
   - Inventory management

3. **Room System**
   - Room creation with unique codes
   - Join room functionality
   - Player management

### Phase 2: Game Engine
4. **Real-time Gameplay**
   - Socket.io integration
   - Turn-based system
   - Dice rolling mechanics
   - Chat system

5. **Combat System**
   - Initiative tracking
   - Health/damage management
   - Spell casting
   - Attack rolls

### Phase 3: AI Integration  
6. **AI Dungeon Master**
   - OpenAI/Anthropic integration
   - Personality configuration
   - Dynamic story generation
   - NPC dialogue

## Development Tips

### Web-based vs Godot Decision
**Why Web-based is recommended:**
- ✅ Cross-platform (any device with browser)
- ✅ Easy real-time multiplayer 
- ✅ Better for forms/text content
- ✅ Easier database integration
- ✅ Better AI API ecosystem
- ✅ No app store deployment hassles

### Architecture Benefits
- **React/Next.js**: Modern, component-based UI
- **Socket.io**: Real-time bidirectional communication
- **PostgreSQL**: Robust data storage with JSON support
- **Node.js**: JavaScript everywhere, easier development

### Next Steps
1. Initialize the projects with `npm install`
2. Set up your database
3. Start with user authentication
4. Build character creation
5. Add room/session management
6. Implement real-time features
7. Integrate AI functionality

## File Structure Explanation

### Client Structure
```
client/src/
├── components/
│   ├── auth/           # Login/register forms
│   ├── character/      # Character sheets & creation
│   ├── game/          # Game board, chat, dice
│   ├── room/          # Room management
│   └── ui/            # Reusable UI components
├── pages/             # Next.js pages
├── hooks/             # Custom React hooks  
├── context/           # Global state management
└── utils/             # Helper functions
```

### Server Structure  
```
server/
├── routes/            # API endpoints
├── models/            # Database models
├── services/          # Business logic
├── middleware/        # Auth, validation, etc.
└── database/          # Schema and migrations
```

Ready to start building your D&D platform! 🎲