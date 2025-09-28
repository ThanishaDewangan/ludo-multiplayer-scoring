const mongoose = require('mongoose');
const Pawn = require('./Pawn');

const playerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  color: {
    type: String,
    required: true,
    enum: ['red', 'blue', 'green', 'yellow']
  },
  socketId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  isReady: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  pawns: [{
    type: mongoose.Schema.Types.Mixed,
    default: function() {
      return Array.from({ length: 4 }, (_, index) => ({
        id: index,
        playerId: this.id,
        position: 'base',
        boardPosition: -1,
        score: 0,
        stepsMoved: 0,
        isAtHome: false,
        color: this.color
      }));
    }
  }],
  captures: {
    type: Number,
    default: 0
  },
  turnsPlayed: {
    type: Number,
    default: 0
  },
  lastMoveTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Initialize pawns when player is created
playerSchema.pre('save', function(next) {
  if (this.isNew && this.pawns.length === 0) {
    this.pawns = Array.from({ length: 4 }, (_, index) => ({
      id: index,
      playerId: this.id,
      position: 'base',
      boardPosition: -1,
      score: 0,
      stepsMoved: 0,
      isAtHome: false,
      color: this.color
    }));
  }
  next();
});

// Calculate total score from all pawns
playerSchema.methods.calculateTotalScore = function() {
  this.totalScore = this.pawns.reduce((total, pawn) => total + pawn.score, 0);
  return this.totalScore;
};

// Update pawn score and recalculate total
playerSchema.methods.updatePawnScore = function(pawnId, stepsMoved) {
  const pawn = this.pawns.find(p => p.id === pawnId);
  if (pawn) {
    pawn.stepsMoved += stepsMoved;
    pawn.score = pawn.stepsMoved;
    this.calculateTotalScore();
  }
  return this.totalScore;
};

// Handle pawn capture - striker gains victim's score
playerSchema.methods.capturePawn = function(victimPawnScore) {
  this.captures++;
  // Find the pawn that made the capture and add victim's score
  // In real implementation, you'd pass the striker pawn ID
  this.totalScore += victimPawnScore;
  return this.totalScore;
};

// Reset captured pawn
playerSchema.methods.resetPawn = function(pawnId) {
  const pawn = this.pawns.find(p => p.id === pawnId);
  if (pawn) {
    pawn.position = 'base';
    pawn.boardPosition = -1;
    pawn.score = 0;
    pawn.stepsMoved = 0;
    pawn.isAtHome = false;
    this.calculateTotalScore();
  }
  return this.totalScore;
};

// Move pawn to board
playerSchema.methods.movePawnToBoard = function(pawnId) {
  const pawn = this.pawns.find(p => p.id === pawnId);
  if (pawn) {
    pawn.position = 'board';
    const startPositions = {
      'red': 16,
      'blue': 55,
      'green': 42,
      'yellow': 29
    };
    pawn.boardPosition = startPositions[this.color];
  }
};

// Move pawn on board
playerSchema.methods.movePawn = function(pawnId, newPosition, stepsMoved) {
  const pawn = this.pawns.find(p => p.id === pawnId);
  if (pawn) {
    pawn.boardPosition = newPosition;

    // Check if pawn reached home
    const homePositions = {
      'red': 73,
      'blue': 79,
      'green': 85,
      'yellow': 91
    };

    if (newPosition >= homePositions[this.color]) {
      pawn.position = 'home';
      pawn.isAtHome = true;
      pawn.score += 56; // Home bonus
    }

    // Update score with steps moved
    pawn.stepsMoved += stepsMoved;
    pawn.score = pawn.stepsMoved + (pawn.isAtHome ? 56 : 0);

    this.calculateTotalScore();
  }
  return this.totalScore;
};

// Get movable pawns based on dice value
playerSchema.methods.getMovablePawns = function(diceValue) {
  return this.pawns.filter(pawn => {
    // Pawns at home cannot move
    if (pawn.isAtHome) return false;

    // Pawns in base can only move on 1 or 6
    if (pawn.position === 'base') {
      return diceValue === 1 || diceValue === 6;
    }

    // Check if move would overshoot home
    const homePositions = {
      'red': 73,
      'blue': 79,
      'green': 85,
      'yellow': 91
    };

    const newPosition = pawn.boardPosition + diceValue;
    return newPosition <= homePositions[this.color];
  });
};

// Check if player has won (all pawns at home)
playerSchema.methods.hasWon = function() {
  return this.pawns.every(pawn => pawn.isAtHome);
};

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;