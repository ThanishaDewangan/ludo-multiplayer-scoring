import React, { useRef, useEffect } from 'react';
import { PLAYER_COLORS } from '../utils/gameConstants';

const Board = ({ 
  players = [], 
  onPawnClick, 
  possibleMoves = [], 
  currentPlayer = null,
  boardSize = 500 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawBoard();
  }, [players, possibleMoves, boardSize]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = boardSize / 15; // 15x15 grid

    // Clear canvas
    ctx.clearRect(0, 0, boardSize, boardSize);

    // Draw board background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, boardSize, boardSize);

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 15; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, boardSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(boardSize, i * cellSize);
      ctx.stroke();
    }

    // Draw player bases
    Object.entries(PLAYER_COLORS).forEach(([colorName, colorConfig]) => {
      ctx.fillStyle = colorConfig.lightColor;
      ctx.strokeStyle = colorConfig.color;
      ctx.lineWidth = 3;

      let baseX, baseY;
      switch (colorName) {
        case 'red':
          baseX = 1 * cellSize;
          baseY = 1 * cellSize;
          break;
        case 'blue':
          baseX = 10 * cellSize;
          baseY = 1 * cellSize;
          break;
        case 'green':
          baseX = 10 * cellSize;
          baseY = 10 * cellSize;
          break;
        case 'yellow':
          baseX = 1 * cellSize;
          baseY = 10 * cellSize;
          break;
        default:
          return;
      }

      // Draw base area
      ctx.fillRect(baseX, baseY, 4 * cellSize, 4 * cellSize);
      ctx.strokeRect(baseX, baseY, 4 * cellSize, 4 * cellSize);

      // Draw base label
      ctx.fillStyle = colorConfig.color;
      ctx.font = `bold ${cellSize * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(
        colorConfig.name.toUpperCase(), 
        baseX + 2 * cellSize, 
        baseY + 2.3 * cellSize
      );
    });

    // Draw center home area
    const centerX = 6 * cellSize;
    const centerY = 6 * cellSize;
    const homeSize = 3 * cellSize;

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.fillRect(centerX, centerY, homeSize, homeSize);
    ctx.strokeRect(centerX, centerY, homeSize, homeSize);

    // Draw HOME text
    ctx.fillStyle = '#2c3e50';
    ctx.font = `bold ${cellSize * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('HOME', centerX + homeSize/2, centerY + homeSize/2 + cellSize * 0.1);

    // Draw pawns (simplified positions)
    players.forEach(player => {
      const colorConfig = PLAYER_COLORS[player.color];
      if (!colorConfig) return;

      player.pawns.forEach((pawn, pawnIndex) => {
        let x, y;

        if (pawn.position === 'base') {
          // Calculate base position
          const basePositions = getBasePositions(player.color, cellSize);
          const pos = basePositions[pawn.id] || basePositions[0];
          x = pos.x;
          y = pos.y;
        } else if (pawn.position === 'home') {
          // Center position
          x = centerX + homeSize/2;
          y = centerY + homeSize/2;
        } else {
          // Simplified board position
          x = boardSize * 0.5 + (pawn.id - 1.5) * cellSize * 0.3;
          y = boardSize * 0.5;
        }

        // Draw pawn
        const pawnRadius = 12;
        const isClickable = possibleMoves.some(move => move.pawnId === pawn.id);

        // Shadow
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, pawnRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // Pawn body
        ctx.beginPath();
        ctx.arc(x, y, pawnRadius, 0, 2 * Math.PI);
        ctx.fillStyle = colorConfig.color;
        ctx.fill();

        // Border
        ctx.strokeStyle = isClickable ? '#ffd700' : colorConfig.darkColor;
        ctx.lineWidth = isClickable ? 3 : 2;
        ctx.stroke();

        // Pawn number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((pawn.id + 1).toString(), x, y);
      });
    });
  };

  const getBasePositions = (color, cellSize) => {
    const baseOffsets = {
      red: { baseX: 2, baseY: 2 },
      blue: { baseX: 11, baseY: 2 },
      green: { baseX: 11, baseY: 11 },
      yellow: { baseX: 2, baseY: 11 }
    };

    const offset = baseOffsets[color];
    if (!offset) return [{ x: 0, y: 0 }];

    return [
      { x: (offset.baseX) * cellSize + cellSize / 2, y: (offset.baseY) * cellSize + cellSize / 2 },
      { x: (offset.baseX + 1) * cellSize + cellSize / 2, y: (offset.baseY) * cellSize + cellSize / 2 },
      { x: (offset.baseX) * cellSize + cellSize / 2, y: (offset.baseY + 1) * cellSize + cellSize / 2 },
      { x: (offset.baseX + 1) * cellSize + cellSize / 2, y: (offset.baseY + 1) * cellSize + cellSize / 2 }
    ];
  };

  const handleCanvasClick = (event) => {
    if (!onPawnClick) return;
    // Simplified click handling - in a real implementation you'd calculate exact positions
    console.log('Canvas clicked - simplified version');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px',
      padding: '24px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <h3 style={{ margin: 0 }}>🎲 Ludo Board</h3>
        {currentPlayer && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: PLAYER_COLORS[currentPlayer.color]?.lightColor,
            borderRadius: '20px'
          }}>
            <span>Current Turn: </span>
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: PLAYER_COLORS[currentPlayer.color]?.color
              }}
            ></div>
            <span>{currentPlayer.name}</span>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={boardSize}
        height={boardSize}
        onClick={handleCanvasClick}
        style={{
          border: '3px solid #2c3e50',
          borderRadius: '16px',
          cursor: 'pointer'
        }}
      />

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {players.map(player => (
          <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: PLAYER_COLORS[player.color]?.color
              }}
            ></div>
            <span style={{ fontSize: '14px' }}>
              {player.name} ({player.totalScore || 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;