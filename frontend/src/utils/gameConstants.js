/**
 * Game constants and utilities for Ludo multiplayer frontend
 */

// Game configuration
export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  PAWNS_PER_PLAYER: 4,
  TURN_TIMEOUT: 15000, // 15 seconds
  GAME_TIMEOUT: 600000, // 10 minutes
};

// Player colors and their properties
export const PLAYER_COLORS = {
  red: {
    name: 'Red',
    color: '#e74c3c',
    lightColor: '#ffebee',
    darkColor: '#c62828',
    startPosition: 16,
    homePosition: 73
  },
  blue: {
    name: 'Blue',
    color: '#3498db',
    lightColor: '#e3f2fd',
    darkColor: '#1565c0',
    startPosition: 55,
    homePosition: 79
  },
  green: {
    name: 'Green',
    color: '#2ecc71',
    lightColor: '#e8f5e8',
    darkColor: '#2e7d32',
    startPosition: 42,
    homePosition: 85
  },
  yellow: {
    name: 'Yellow',
    color: '#f1c40f',
    lightColor: '#fffde7',
    darkColor: '#f57f17',
    startPosition: 29,
    homePosition: 91
  }
};

// Game states
export const GAME_STATES = {
  WAITING: 'waiting',
  READY: 'ready',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Move validation
export const canPawnMove = (pawn, diceValue) => {
  if (pawn.isAtHome) return false;
  if (pawn.position === 'base' && diceValue !== 1 && diceValue !== 6) {
    return false;
  }
  if (pawn.position === 'board') {
    const homePosition = PLAYER_COLORS[pawn.color].homePosition;
    const newPosition = pawn.boardPosition + diceValue;
    if (newPosition > homePosition) return false;
  }
  return true;
};

// Utility functions
export const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatScore = (score) => {
  return score.toString().padStart(3, '0');
};

export const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export default {
  GAME_CONFIG,
  PLAYER_COLORS,
  GAME_STATES,
  canPawnMove,
  formatTime,
  formatScore,
  generatePlayerId,
  generateRoomId
};