import React from 'react';
import { PLAYER_COLORS, formatScore, formatTime } from '../utils/gameConstants';

const Scoreboard = ({ 
  scores = {}, 
  leaderboard = [], 
  gameTime = 0, 
  currentTurn = 'red',
  gameState = 'waiting'
}) => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '20px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🏆 Live Scoreboard</h3>

      {gameTime > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '8px', background: '#667eea', color: 'white', borderRadius: '8px' }}>
          ⏱️ Game Time: {formatTime(gameTime)}
        </div>
      )}

      <div>
        {leaderboard.length > 0 ? (
          leaderboard.map((player, index) => {
            const colorConfig = PLAYER_COLORS[player.color];
            const isCurrentTurn = player.color === currentTurn;

            return (
              <div 
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  margin: '8px 0',
                  background: isCurrentTurn ? colorConfig?.lightColor : '#f8f9fa',
                  borderRadius: '8px',
                  border: isCurrentTurn ? `2px solid ${colorConfig?.color}` : '1px solid #e9ecef'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    background: colorConfig?.color, 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '50%',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    #{index + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600' }}>{player.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{colorConfig?.name}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: colorConfig?.color }}>
                    {formatScore(player.totalScore)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    🏠 {player.pawnsAtHome || 0}/4  ⚔️ {player.captures || 0}
                  </div>
                </div>

                {isCurrentTurn && gameState === 'playing' && (
                  <div style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    background: '#00b894', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    fontSize: '10px' 
                  }}>
                    Your Turn
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <p>Waiting for game to start...</p>
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px' }}>📊 Scoring Rules</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            <div>👣 +1 point per step moved</div>
            <div>⚔️ Gain captured pawn's score</div>
            <div>🏠 +56 points for reaching home</div>
            <div>🏆 Highest score wins!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;