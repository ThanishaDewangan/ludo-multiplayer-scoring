const mongoose = require('mongoose');

const pawnSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    min: 0,
    max: 3 // Each player has 4 pawns (0-3)
  },
  playerId: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'base',
    enum: ['base', 'board', 'home']
  },
  boardPosition: {
    type: Number,
    default: -1, // -1 means not on board
    min: -1,
    max: 91 // Board positions 0-91 (including home stretches)
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  stepsMoved: {
    type: Number,
    default: 0,
    min: 0
  },
  isAtHome: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    required: true,
    enum: ['red', 'blue', 'green', 'yellow']
  }
}, {
  timestamps: true
});

// Calculate score based on steps moved
pawnSchema.methods.updateScore = function(newSteps) {
  this.stepsMoved += newSteps;
  this.score = this.stepsMoved;
  return this.score;
};

// Reset pawn when captured
pawnSchema.methods.resetPawn = function() {
  this.position = 'base';
  this.boardPosition = -1;
  this.score = 0;
  this.stepsMoved = 0;
  this.isAtHome = false;
};

// Move pawn to board
pawnSchema.methods.moveToBoard = function(startPosition) {
  this.position = 'board';
  this.boardPosition = startPosition;
};

// Move pawn to home
pawnSchema.methods.moveToHome = function() {
  this.position = 'home';
  this.isAtHome = true;
  // Bonus points for reaching home (as per traditional Ludo scoring)
  this.score += 56;
};

// Check if pawn can move
pawnSchema.methods.canMove = function(diceValue, gameState) {
  // If pawn is in base, can only move on 1 or 6
  if (this.position === 'base') {
    return diceValue === 1 || diceValue === 6;
  }

  // If pawn is at home, cannot move
  if (this.position === 'home') {
    return false;
  }

  // Check if move would overshoot home
  const newPosition = this.boardPosition + diceValue;
  const homePosition = this.getHomePosition();

  return newPosition <= homePosition;
};

// Get home position based on color
pawnSchema.methods.getHomePosition = function() {
  const homePositions = {
    'red': 73,
    'blue': 79, 
    'green': 85,
    'yellow': 91
  };
  return homePositions[this.color];
};

// Get starting position on board based on color
pawnSchema.methods.getStartPosition = function() {
  const startPositions = {
    'red': 16,
    'blue': 55,
    'green': 42, 
    'yellow': 29
  };
  return startPositions[this.color];
};

const Pawn = mongoose.model('Pawn', pawnSchema);

module.exports = Pawn;