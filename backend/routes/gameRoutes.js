const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Player = require('../models/Player');
const ScoreUtils = require('../utils/scoreUtils');
const GameUtils = require('../utils/gameUtils');

// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ 
      gameState: { $in: ['waiting', 'ready'] },
      isPrivate: false 
    })
    .populate('players')
    .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create new room
router.post('/rooms', async (req, res) => {
  try {
    const { name, maxPlayers, isPrivate, password, createdBy } = req.body;

    const room = new Room({
      name: name || `Room ${Math.random().toString(36).substr(2, 6)}`,
      maxPlayers: maxPlayers || 4,
      isPrivate: isPrivate || false,
      password: password || null,
      createdBy
    });

    await room.save();

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join room
router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    const { playerName, playerId, socketId } = req.body;
    const roomId = req.params.roomId;

    const room = await Room.findOne({ id: roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.isFull()) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Assign color based on current players
    const assignedColor = GameUtils.COLORS[room.currentPlayers];

    const player = new Player({
      id: playerId,
      name: playerName,
      color: assignedColor,
      socketId,
      roomId
    });

    await player.save();

    // Update room
    room.players.push(player._id);
    room.currentPlayers++;
    room.playerScores.set(playerId, 0);

    if (room.currentPlayers >= 2) {
      room.gameState = 'ready';
    }

    await room.save();

    res.json({ player, room });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Set player ready status
router.post('/rooms/:roomId/ready', async (req, res) => {
  try {
    const { playerId, isReady } = req.body;

    const player = await Player.findOne({ id: playerId, roomId: req.params.roomId });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.isReady = isReady;
    await player.save();

    res.json({ player });
  } catch (error) {
    console.error('Error setting ready status:', error);
    res.status(500).json({ error: 'Failed to set ready status' });
  }
});

// Get room scores
router.get('/rooms/:roomId/scores', async (req, res) => {
  try {
    const room = await Room.findOne({ id: req.params.roomId }).populate('players');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const scores = ScoreUtils.formatScoresForEmission(room.players);
    const leaderboard = ScoreUtils.determineWinner(room.players).leaderboard;

    res.json({
      scores,
      leaderboard,
      gameTime: room.getRemainingTime(),
      gameState: room.gameState
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

module.exports = router;