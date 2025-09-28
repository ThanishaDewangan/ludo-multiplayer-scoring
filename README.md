# 🎲 Ludo Multiplayer with Real-Time Scoring System

A complete multiplayer Ludo game built with MERN stack + Socket.IO, featuring a unique real-time scoring system as requested in the QreateAI Full Stack Developer intern hiring process.

## 🌟 Features

### ✨ Real-Time Scoring System
- **Pawn Progress Scoring**: +1 point per step moved
- **Capture Rule**: Striker gains victim's score, victim resets to 0
- **Player Total Score**: Sum of all pawn scores
- **Live Updates**: Real-time score synchronization across all players
- **Winner Detection**: Highest score wins when timer ends

### 🎮 Game Features
- **Multiplayer Support**: 2-4 players per room
- **Real-time Synchronization**: Socket.IO for instant updates
- **Interactive Board**: Canvas-based Ludo board with animations
- **Smart Dice**: Animated dice with move validation
- **Turn Management**: 15-second turn timer with auto-move
- **Game Timer**: 10-minute game duration
- **Mobile Responsive**: Works on all device sizes

### 💻 Technical Features
- **MERN Stack**: MongoDB, Express, React, Node.js
- **Socket.IO**: Real-time communication
- **Modular Architecture**: Clean, maintainable code
- **RESTful API**: Complete game management
- **Docker Ready**: Container configuration included

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ludo-multiplayer-scoring

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Setup
```bash
# Backend - create .env file
cd backend
cp .env.example .env

# Edit .env with your MongoDB URL and other settings
MONGODB_URI=mongodb://localhost:27017/ludo_multiplayer
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Application
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend  
cd frontend
npm start
```

### 4. Play the Game
1. Open http://localhost:3000
2. Create or join a room
3. Wait for 2-4 players
4. Click "Ready" to start
5. Enjoy the real-time scoring system!

## 🎯 Scoring System Details

### How Scoring Works
1. **Movement Points**: Each pawn earns 1 point per step moved
2. **Capture Bonus**: When you capture an opponent, you gain their pawn's score
3. **Home Bonus**: +56 points when a pawn reaches home
4. **Total Score**: Sum of all your pawns' scores
5. **Winner**: Highest total score when time runs out

### Example Scoring
```
Player Red moves 6 steps → Pawn score: 6 points
Player Blue captures Red's pawn → Blue gains 6 points, Red's pawn resets to 0
Player Red reaches home → +56 bonus points
Final: Player scores = Sum of all pawn scores
```

## 🏗️ Project Structure

```
ludo-multiplayer-scoring/
├── backend/
│   ├── models/
│   │   ├── Room.js          # Game room model
│   │   ├── Player.js        # Player model with scoring
│   │   └── Pawn.js          # Pawn model with position tracking
│   ├── routes/
│   │   └── gameRoutes.js    # REST API endpoints
│   ├── utils/
│   │   ├── scoreUtils.js    # Scoring system utilities
│   │   └── gameUtils.js     # Game logic utilities
│   ├── server.js            # Main server with Socket.IO
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.js     # Interactive game board
│   │   │   ├── Dice.js      # Animated dice component
│   │   │   ├── Scoreboard.js # Real-time scoring display
│   │   │   ├── GameRoom.js  # Main game interface
│   │   │   └── PlayerList.js # Player management
│   │   ├── utils/
│   │   │   ├── socketClient.js # Socket.IO client
│   │   │   └── gameConstants.js # Game configuration
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
├── docker-compose.yml       # Container setup
└── README.md
```

## 🔧 API Endpoints

### Room Management
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room

### Game Operations
- `POST /api/rooms/:id/ready` - Set player ready status
- `GET /api/rooms/:id/scores` - Get current scores
- `POST /api/rooms/:id/validate-move` - Validate move
- `GET /api/rooms/:id/players/:playerId/moves/:dice` - Get possible moves

## 🌐 Socket Events

### Client → Server
- `room:join` - Join game room
- `room:leave` - Leave game room  
- `player:ready` - Set ready status
- `game:roll` - Roll dice
- `game:move` - Move pawn

### Server → Client
- `room:data` - Room state updates
- `game:start` - Game started
- `game:roll` - Dice roll result
- `game:move` - Pawn movement
- `game:scores` - Score updates
- `game:turn` - Turn changes
- `game:winner` - Game finished

## 🎨 UI Components

### Real-Time Scoreboard
- Live score updates for all players
- Leaderboard with rankings
- Game timer and turn timer
- Scoring rules explanation
- Winner announcement

### Interactive Board
- Canvas-based Ludo board
- Animated pawn movements
- Click-to-move interface
- Possible moves highlighting
- Player turn indicators

### Smart Dice
- 3D dice animation
- Roll validation
- Special roll indicators (6 = extra turn)
- Turn-based rolling

## 🐳 Docker Setup

```bash
# Run with Docker Compose
docker-compose up -d

# This will start:
# - MongoDB container
# - Backend server (port 5000)  
# - Frontend development server (port 3000)
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend  
npm test
```

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Touch interfaces

## 🔒 Security Features

- Input validation
- Session management
- CORS configuration
- Error handling
- Rate limiting ready

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=<your-mongodb-url>
PORT=5000
FRONTEND_URL=<your-frontend-url>
SESSION_SECRET=<your-secret-key>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for QreateAI Full Stack Developer intern hiring process
- Inspired by traditional Ludo game rules
- Enhanced with modern real-time scoring system
- Uses best practices for MERN stack development

## 📞 Support

For questions or issues:
- Create an issue in this repository
- Contact: [your-email@example.com]

---

**Happy Gaming! 🎲✨**

> This project demonstrates advanced full-stack development skills including real-time systems, game logic, responsive UI, and scalable architecture.
