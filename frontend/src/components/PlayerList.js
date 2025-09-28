import React from 'react';
import { PLAYER_COLORS } from '../utils/gameConstants';

const PlayerList = ({ players = [], myPlayerId, currentTurn, gameState }) => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minHeight: '300px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h3 style={{ margin: 0 }}>👥 Players</h3>
        <span style={{ 
          background: '#667eea', 
          color: 'white', 
          padding: '6px 12px',
          borderRadius: '15px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {players.length}/4
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {players.map(player => {
          const colorConfig = PLAYER_COLORS[player.color];
          const isMe = player.id === myPlayerId;
          const isCurrentTurn = player.color === currentTurn;
          const pawnsAtHome = player.pawns ? player.pawns.filter(p => p.isAtHome).length : 0;

          return (
            <div 
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: isMe ? 'rgba(102, 126, 234, 0.05)' : 'white',
                borderRadius: '12px',
                border: isCurrentTurn ? `2px solid ${colorConfig?.color}` : `2px solid ${isMe ? '#667eea' : '#e9ecef'}`,
                position: 'relative'
              }}
            >
              <div 
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: colorConfig?.color,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              ></div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {player.name} {isMe ? '(You)' : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {colorConfig?.name}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 8px',
                  background: 'rgba(127, 140, 141, 0.1)',
                  borderRadius: '8px'
                }}>
                  <span>🏆</span>
                  <span style={{ fontWeight: '600' }}>{player.totalScore || 0}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 8px',
                  background: 'rgba(127, 140, 141, 0.1)',
                  borderRadius: '8px'
                }}>
                  <span>🏠</span>
                  <span style={{ fontWeight: '600' }}>{pawnsAtHome}/4</span>
                </div>
              </div>

              <div style={{ fontSize: '10px' }}>
                {gameState === 'waiting' && (
                  <span style={{ 
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: player.isReady ? '#00b894' : 'rgba(241, 196, 15, 0.2)',
                    color: player.isReady ? 'white' : '#f39c12',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
                  </span>
                )}
                {gameState === 'playing' && isCurrentTurn && (
                  <span style={{ 
                    background: '#ffd700',
                    color: '#2c3e50',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontWeight: '700'
                  }}>
                    🎯 Your Turn
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: 4 - players.length }, (_, index) => (
          <div key={`empty-${index}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            border: '2px dashed #bdc3c7',
            background: 'rgba(189, 195, 199, 0.1)',
            opacity: 0.7,
            color: '#7f8c8d'
          }}>
            <span style={{ fontSize: '24px', opacity: 0.5 }}>👤</span>
            <span style={{ fontStyle: 'italic' }}>Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;