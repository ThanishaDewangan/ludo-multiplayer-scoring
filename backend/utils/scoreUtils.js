/**
 * Scoring utility functions for Ludo multiplayer game
 * Implements the real-time scoring system as per requirements
 */

class ScoreUtils {
  /**
   * Calculate pawn score based on steps moved
   * Formula: pawnScore += stepsMoved (dice value in current turn)
   */
  static calculatePawnScore(currentScore, stepsMoved) {
    return currentScore + stepsMoved;
  }

  /**
   * Handle capture rule scoring
   * striker_score += victim_score
   * victim_score = 0
   * victim_position = "base"
   */
  static handleCapture(strikerPlayer, victimPlayer, victimPawnId) {
    const victimPawn = victimPlayer.pawns.find(p => p.id === victimPawnId);
    if (!victimPawn) return { strikerScore: strikerPlayer.totalScore, victimScore: victimPlayer.totalScore };

    const victimScore = victimPawn.score;

    // Reset victim pawn
    victimPawn.position = 'base';
    victimPawn.boardPosition = -1;
    victimPawn.score = 0;
    victimPawn.stepsMoved = 0;
    victimPawn.isAtHome = false;

    // Add victim's score to striker's total
    strikerPlayer.totalScore += victimScore;
    strikerPlayer.captures++;

    // Recalculate victim's total score
    victimPlayer.calculateTotalScore();

    return {
      strikerScore: strikerPlayer.totalScore,
      victimScore: victimPlayer.totalScore,
      capturedScore: victimScore
    };
  }

  /**
   * Calculate player total score
   * playerScore = Σ(pawnScores)
   */
  static calculatePlayerScore(player) {
    return player.pawns.reduce((total, pawn) => total + pawn.score, 0);
  }

  /**
   * Update pawn score when it moves
   */
  static updatePawnScore(player, pawnId, stepsMoved) {
    const pawn = player.pawns.find(p => p.id === pawnId);
    if (!pawn) return player.totalScore;

    // Update pawn score
    pawn.stepsMoved += stepsMoved;
    pawn.score = pawn.stepsMoved;

    // Add home bonus if pawn reached home
    if (pawn.isAtHome && !pawn.homeBonus) {
      pawn.score += 56;
      pawn.homeBonus = true;
    }

    // Recalculate total score
    player.calculateTotalScore();
    return player.totalScore;
  }

  /**
   * Get scores for all players in a room
   */
  static getRoomScores(players) {
    const scores = {};
    players.forEach(player => {
      scores[player.id] = {
        totalScore: this.calculatePlayerScore(player),
        captures: player.captures,
        pawnsAtHome: player.pawns.filter(p => p.isAtHome).length,
        color: player.color,
        name: player.name
      };
    });
    return scores;
  }

  /**
   * Determine winner based on scoring rules
   * Primary: Highest score
   * Tie-breaker: Most captures
   */
  static determineWinner(players) {
    const playerScores = players.map(player => ({
      id: player.id,
      name: player.name,
      color: player.color,
      totalScore: this.calculatePlayerScore(player),
      captures: player.captures,
      pawnsAtHome: player.pawns.filter(p => p.isAtHome).length
    }));

    // Sort by total score (descending), then by captures (descending)
    playerScores.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.captures - a.captures;
    });

    return {
      winner: playerScores[0],
      leaderboard: playerScores
    };
  }

  /**
   * Check for traditional win condition (all pawns home)
   */
  static checkTraditionalWin(player) {
    return player.pawns.every(pawn => pawn.isAtHome);
  }

  /**
   * Format scores for real-time emission
   */
  static formatScoresForEmission(players) {
    const formattedScores = {};

    players.forEach(player => {
      formattedScores[player.id] = {
        playerId: player.id,
        playerName: player.name,
        color: player.color,
        totalScore: this.calculatePlayerScore(player),
        pawnScores: player.pawns.map(pawn => ({
          id: pawn.id,
          score: pawn.score,
          position: pawn.position,
          isAtHome: pawn.isAtHome
        })),
        captures: player.captures,
        pawnsAtHome: player.pawns.filter(p => p.isAtHome).length
      };
    });

    return formattedScores;
  }

  /**
   * Generate real-time score update event data
   */
  static generateScoreUpdateEvent(room, updatedPlayers, moveDetails) {
    return {
      type: 'game:scores',
      data: {
        roomId: room.id,
        scores: this.formatScoresForEmission(updatedPlayers),
        leaderboard: this.determineWinner(updatedPlayers).leaderboard,
        gameTime: room.getRemainingTime(),
        turnTime: room.getTurnRemainingTime(),
        currentTurn: room.currentTurn,
        moveDetails: moveDetails || null
      },
      timestamp: new Date()
    };
  }
}

module.exports = ScoreUtils;