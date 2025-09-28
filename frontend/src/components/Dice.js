import React, { useState, useEffect } from 'react';

const Dice = ({ 
  value = 1, 
  onRoll, 
  disabled = false, 
  isRolling = false,
  canRoll = true,
  currentPlayer = null 
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isRolling) {
      const rollAnimation = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(rollAnimation);
        setDisplayValue(value);
      }, 1000);

      return () => clearInterval(rollAnimation);
    } else {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  const handleRoll = () => {
    if (!disabled && canRoll && !isRolling && onRoll) {
      onRoll();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px',
      padding: '20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div 
        style={{
          width: '80px',
          height: '80px',
          background: isRolling ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
          border: '3px solid #667eea',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 'bold',
          color: isRolling ? 'white' : '#2c3e50',
          cursor: canRoll && !disabled ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          transform: isRolling ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
        onClick={handleRoll}
      >
        {displayValue}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Rolled: <strong>{displayValue}</strong>
        </div>

        {currentPlayer && (
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
            {currentPlayer.name}'s turn
          </div>
        )}

        {canRoll && !disabled ? (
          <button 
            onClick={handleRoll}
            disabled={!canRoll || isRolling}
            style={{
              background: 'linear-gradient(135deg, #00b894, #00cec9)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: (!canRoll || isRolling) ? 0.6 : 1
            }}
          >
            {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
          </button>
        ) : (
          <div style={{ fontSize: '12px', color: '#999' }}>
            {isRolling ? 'Rolling...' : 'Not your turn'}
          </div>
        )}
      </div>

      {displayValue === 6 && !isRolling && (
        <div style={{ 
          background: '#00b894', 
          color: 'white', 
          padding: '4px 12px', 
          borderRadius: '12px',
          fontSize: '10px'
        }}>
          🎉 Six! Roll again!
        </div>
      )}
    </div>
  );
};

export default Dice;