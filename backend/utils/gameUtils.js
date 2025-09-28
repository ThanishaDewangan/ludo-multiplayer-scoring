/**
 * Game utility functions for Ludo multiplayer game
 * Handles core game logic and rules
 */

class GameUtils {
  /**
   * Board constants
   */
  static BOARD_SIZE = 72;
  static COLORS = ['red', 'blue', 'green', 'yellow'];

  static START_POSITIONS = {
    'red': 16,
    'blue': 55,
    'green': 42,
    'yellow': 29
  };

  static HOME_POSITIONS = {
    'red': 73,
    'blue': 79,
    'green': 85,
    'yellow': 91
  };

  /**
   * Check if a dice value allows pawn to exit base
   */
  static canExitBase(diceValue) {
    return diceValue === 1 || diceValue === 6;
  }

  /**
   * Validate if a move is legal
   */
  static isValidMove(pawn, diceValue, boardState) {
    // Pawn at home cannot move
    if (pawn.isAtHome) {
      return { valid: false, reason: 'Pawn already at home' };
    }

    // Pawn in base needs 1 or 6 to move
    if (pawn.position === 'base' && !this.canExitBase(diceValue)) {
      return { valid: false, reason: 'Need 1 or 6 to exit base' };
    }

    // Check if move would overshoot home
    if (pawn.position === 'board') {
      const newPosition = pawn.boardPosition + diceValue;
      const homePosition = this.HOME_POSITIONS[pawn.color];

      if (newPosition > homePosition) {
        return { valid: false, reason: 'Cannot overshoot home' };
      }
    }

    return { valid: true };
  }

  /**
   * Execute a move and return updated game state
   */
  static executeMove(room, player, pawnId, diceValue) {
    const pawn = player.pawns.find(p => p.id === pawnId);
    if (!pawn) {
      return { success: false, reason: 'Pawn not found' };
    }

    // Validate move
    const validation = this.isValidMove(pawn, diceValue, { players: [player] });
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const moveResult = {
      success: true,
      pawnMoved: pawnId,
      steps: diceValue,
      capture: null,
      reachedHome: false,
      bonusPoints: 0
    };

    // Execute the move
    if (pawn.position === 'base') {
      // Move from base to board
      pawn.position = 'board';
      pawn.boardPosition = this.START_POSITIONS[pawn.color];
      moveResult.fromBase = true;
    } else {
      // Move on board
      const newPosition = pawn.boardPosition + diceValue;
      pawn.boardPosition = newPosition;

      // Check if reached home
      if (newPosition >= this.HOME_POSITIONS[pawn.color]) {
        pawn.position = 'home';
        pawn.isAtHome = true;
        moveResult.reachedHome = true;
        moveResult.bonusPoints += 56; // Home bonus
      }
    }

    // Update pawn score
    pawn.stepsMoved += diceValue;
    pawn.score = pawn.stepsMoved + (pawn.isAtHome ? 56 : 0);

    return moveResult;
  }

  /**
   * Get all possible moves for a player
   */
  static getPossibleMoves(player, diceValue) {
    const possibleMoves = [];

    for (const pawn of player.pawns) {
      const validation = this.isValidMove(pawn, diceValue, { players: [player] });
      if (validation.valid) {
        possibleMoves.push({
          pawnId: pawn.id,
          currentPosition: pawn.boardPosition,
          newPosition: pawn.position === 'base' ? this.START_POSITIONS[pawn.color] : pawn.boardPosition + diceValue,
          scoreGain: diceValue
        });
      }
    }

    return possibleMoves;
  }

  /**
   * Check if player should get another turn
   */
  static shouldGetAnotherTurn(diceValue, consecutiveSixes, moveResult) {
    // Get another turn if:
    // 1. Rolled a 6 (and not 3 consecutive 6s)
    // 2. Captured an opponent
    // 3. Reached home

    if (diceValue === 6 && consecutiveSixes < 2) {
      return true;
    }

    if (moveResult && (moveResult.capture || moveResult.reachedHome)) {
      return true;
    }

    return false;
  }

  /**
   * Check if game should end based on traditional rules
   */
  static checkGameEnd(players) {
    // Check if any player has all pawns at home
    for (const player of players) {
      if (player.pawns.every(pawn => pawn.isAtHome)) {
        return {
          gameEnded: true,
          winner: player.id,
          winCondition: 'all_pawns_home'
        };
      }
    }

    return { gameEnded: false };
  }

  /**
   * Get game statistics
   */
  static getGameStatistics(room) {
    const stats = {
      totalMoves: 0,
      capturesMade: 0,
      pawnsAtHome: 0,
      gameTimeElapsed: 0,
      averageScorePerPlayer: 0
    };

    room.players.forEach(player => {
      stats.totalMoves += player.turnsPlayed;
      stats.capturesMade += player.captures;
      stats.pawnsAtHome += player.pawns.filter(p => p.isAtHome).length;
    });

    if (room.gameTimer.startTime) {
      stats.gameTimeElapsed = Date.now() - room.gameTimer.startTime.getTime();
    }

    const totalScore = Array.from(room.playerScores.values()).reduce((sum, score) => sum + score, 0);
    stats.averageScorePerPlayer = room.players.length > 0 ? totalScore / room.players.length : 0;

    return stats;
  }
}

module.exports = GameUtils;