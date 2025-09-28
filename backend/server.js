const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models and utils
const Room = require('./models/Room');
const Player = require('./models/Player');
const ScoreUtils = require('./utils/scoreUtils');
const GameUtils = require('./utils/gameUtils');

// Import routes
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ludo_multiplayer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📁 Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api', gameRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ludo Multiplayer Server with Real-time Scoring System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join room
  socket.on('room:join', async (data) => {
    try {
      const { roomId, playerId, playerName } = data;

      const room = await Room.findOne({ id: roomId }).populate('players');
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.playerId = playerId;

      // Emit updated room data to all players
      const updatedRoom = await Room.findOne({ id: roomId }).populate('players');
      io.to(roomId).emit('room:data', updatedRoom);

      console.log(`👤 Player ${playerName} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Player ready
  socket.on('player:ready', async (data) => {
    try {
      const { isReady } = data;

      if (!socket.playerId) return;

      const player = await Player.findOne({ id: socket.playerId });
      if (player) {
        player.isReady = isReady;
        await player.save();
      }

      const room = await Room.findOne({ id: socket.roomId }).populate('players');
      if (room) {
        const allReady = room.players.every(p => p.isReady) && room.players.length >= 2;

        if (allReady && room.gameState === 'ready') {
          // Start game
          room.startGame();
          await room.save();

          io.to(socket.roomId).emit('game:start', {
            room,
            message: 'Game started! Red player goes first.'
          });

          // Emit initial scores
          const scores = ScoreUtils.formatScoresForEmission(room.players);
          io.to(socket.roomId).emit('game:scores', {
            scores,
            leaderboard: ScoreUtils.determineWinner(room.players).leaderboard,
            gameTime: room.getRemainingTime(),
            currentTurn: room.currentTurn
          });
        }

        io.to(socket.roomId).emit('room:data', room);
      }
    } catch (error) {
      console.error('Error setting ready status:', error);
      socket.emit('error', { message: 'Failed to set ready status' });
    }
  });

  // Dice roll
  socket.on('game:roll', async () => {
    try {
      if (!socket.roomId || !socket.playerId) return;

      const room = await Room.findOne({ id: socket.roomId }).populate('players');
      if (!room || room.gameState !== 'playing') return;

      // Check if it's player's turn
      const player = room.players.find(p => p.id === socket.playerId);
      if (!player || player.color !== room.currentTurn) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Roll dice
      const diceValue = room.rollDice();
      await room.save();

      // Get possible moves
      const possibleMoves = GameUtils.getPossibleMoves(player, diceValue);

      // Emit dice roll result
      io.to(socket.roomId).emit('game:roll', {
        playerId: socket.playerId,
        diceValue,
        possibleMoves,
        canMove: possibleMoves.length > 0
      });

      console.log(`🎲 Player ${player.name} rolled ${diceValue}`);

    } catch (error) {
      console.error('Error rolling dice:', error);
      socket.emit('error', { message: 'Failed to roll dice' });
    }
  });

  // Move pawn
  socket.on('game:move', async (data) => {
    try {
      const { pawnId } = data;

      if (!socket.roomId || !socket.playerId) return;

      const room = await Room.findOne({ id: socket.roomId }).populate('players');
      if (!room || room.gameState !== 'playing') return;

      const player = room.players.find(p => p.id === socket.playerId);
      if (!player || player.color !== room.currentTurn) return;

      const moveResult = GameUtils.executeMove(room, player, pawnId, room.diceValue);

      if (!moveResult.success) {
        io.to(room.id).emit('error', { message: moveResult.reason });
        return;
      }

      // Update player scores
      const updatedScore = ScoreUtils.updatePawnScore(player, pawnId, room.diceValue);
      room.updatePlayerScores(player.id, updatedScore);

      // Save changes
      await player.save();
      await room.save();

      // Emit move result and updated scores
      io.to(room.id).emit('game:move', {
        playerId: player.id,
        pawnId,
        moveResult,
        gameState: room.gameState
      });

      const scoreUpdate = ScoreUtils.generateScoreUpdateEvent(room, room.players, moveResult);
      io.to(room.id).emit('game:scores', scoreUpdate.data);

      // Handle turn progression
      const shouldContinue = GameUtils.shouldGetAnotherTurn(
        room.diceValue, 
        room.consecutiveSixes, 
        moveResult
      );

      if (!shouldContinue) {
        const nextTurn = room.nextTurn();
        await room.save();

        io.to(room.id).emit('game:turn', {
          currentTurn: nextTurn,
          turnTime: room.getTurnRemainingTime(),
          gameTime: room.getRemainingTime()
        });
      }

    } catch (error) {
      console.error('Error moving pawn:', error);
      socket.emit('error', { message: 'Failed to move pawn' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    if (socket.roomId && socket.playerId) {
      socket.leave(socket.roomId);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('🎲 Ludo Multiplayer Server with Real-time Scoring System');
});

module.exports = { app, server, io };