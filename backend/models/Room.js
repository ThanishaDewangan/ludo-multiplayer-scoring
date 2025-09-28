const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4().substring(0, 8).toUpperCase(),
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  maxPlayers: {
    type: Number,
    default: 4,
    min: 2,
    max: 4
  },
  currentPlayers: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  gameState: {
    type: String,
    enum: ['waiting', 'ready', 'playing', 'finished'],
    default: 'waiting'
  },
  currentTurn: {
    type: String,
    default: 'red',
    enum: ['red', 'blue', 'green', 'yellow']
  },
  turnOrder: [{
    type: String,
    enum: ['red', 'blue', 'green', 'yellow']
  }],
  diceValue: {
    type: Number,
    min: 1,
    max: 6,
    default: 1
  },
  consecutiveSixes: {
    type: Number,
    default: 0,
    max: 2
  },
  playerScores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  gameTimer: {
    startTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 600000 // 10 minutes in milliseconds
    },
    remaining: {
      type: Number,
      default: 600000
    }
  },
  turnTimer: {
    startTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 15000 // 15 seconds per turn
    }
  },
  winner: {
    type: String,
    default: null
  },
  winCondition: {
    type: String,
    enum: ['all_home', 'highest_score', 'time_up'],
    default: null
  },
  gameSettings: {
    enableScoring: {
      type: Boolean,
      default: true
    },
    enableTimer: {
      type: Boolean,
      default: true
    },
    autoMove: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Initialize turn order when game starts
roomSchema.methods.initializeTurnOrder = function() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  this.turnOrder = colors.slice(0, this.currentPlayers);
  this.currentTurn = this.turnOrder[0];
};

// Get next player in turn order
roomSchema.methods.nextTurn = function() {
  const currentIndex = this.turnOrder.indexOf(this.currentTurn);
  const nextIndex = (currentIndex + 1) % this.turnOrder.length;
  this.currentTurn = this.turnOrder[nextIndex];

  // Reset consecutive sixes for new player
  this.consecutiveSixes = 0;

  // Start turn timer
  this.turnTimer.startTime = new Date();

  return this.currentTurn;
};

// Handle dice roll
roomSchema.methods.rollDice = function() {
  this.diceValue = Math.floor(Math.random() * 6) + 1;

  if (this.diceValue === 6) {
    this.consecutiveSixes++;
  } else {
    this.consecutiveSixes = 0;
  }

  return this.diceValue;
};

// Update player scores
roomSchema.methods.updatePlayerScores = function(playerId, newScore) {
  this.playerScores.set(playerId, newScore);
  this.markModified('playerScores');
};

// Get current scores sorted by highest
roomSchema.methods.getScoresLeaderboard = function() {
  const scores = Array.from(this.playerScores.entries());
  return scores.sort((a, b) => b[1] - a[1]);
};

// Check if game should end
roomSchema.methods.checkGameEnd = function() {
  // Check if time is up
  if (this.gameTimer.startTime && this.gameSettings.enableTimer) {
    const elapsed = Date.now() - this.gameTimer.startTime.getTime();
    if (elapsed >= this.gameTimer.duration) {
      this.gameState = 'finished';
      this.winCondition = 'time_up';

      // Find winner by highest score
      const leaderboard = this.getScoresLeaderboard();
      if (leaderboard.length > 0) {
        this.winner = leaderboard[0][0];

        // Handle tie-breaker (most captures)
        if (leaderboard.length > 1 && leaderboard[0][1] === leaderboard[1][1]) {
          // Additional tie-breaker logic can be implemented here
        }
      }

      return true;
    }
  }

  return false;
};

// Start game
roomSchema.methods.startGame = function() {
  this.gameState = 'playing';
  this.gameTimer.startTime = new Date();
  this.turnTimer.startTime = new Date();
  this.initializeTurnOrder();

  // Initialize player scores
  this.players.forEach(player => {
    this.playerScores.set(player.id, 0);
  });
  this.markModified('playerScores');
};

// Check if room is full
roomSchema.methods.isFull = function() {
  return this.currentPlayers >= this.maxPlayers;
};

// Check if all players are ready
roomSchema.methods.allPlayersReady = function() {
  return this.currentPlayers >= 2; // Minimum 2 players to start
};

// Get remaining time
roomSchema.methods.getRemainingTime = function() {
  if (!this.gameTimer.startTime) return this.gameTimer.duration;

  const elapsed = Date.now() - this.gameTimer.startTime.getTime();
  return Math.max(0, this.gameTimer.duration - elapsed);
};

// Get turn remaining time
roomSchema.methods.getTurnRemainingTime = function() {
  if (!this.turnTimer.startTime) return this.turnTimer.duration;

  const elapsed = Date.now() - this.turnTimer.startTime.getTime();
  return Math.max(0, this.turnTimer.duration - elapsed);
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;