import React, { useState, useEffect, useCallback } from 'react';
import socketClient from '../utils/socketClient';
import Scoreboard from './Scoreboard';
import Board from './Board';
import Dice from './Dice';
import PlayerList from './PlayerList';
import { GAME_STATES, generatePlayerId } from '../utils/gameConstants';

const GameRoom = ({ roomId, playerName, onLeaveRoom }) => {
  const [gameState, setGameState] = useState({
    room: null,
    players: [],
    myPlayer: null,
    scores: {},
    leaderboard: [],
    gameTime: 0,
    currentTurn: 'red',
    diceValue: 1,
    possibleMoves: [],
    isRolling: false,
    canRoll: false,
    gameStatus: GAME_STATES.WAITING,
    messages: []
  });

  const [playerId] = useState(() => generatePlayerId());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    socketClient.connect();

    const handleConnected = () => {
      setConnected(true);
      joinRoom();
    };

    const handleDisconnected = () => {
      setConnected(false);
      setError('Disconnected from server');
    };

    const handleError = (errorData) => {
      setError(errorData.message || 'Connection error');
    };

    socketClient.on('connected', handleConnected);
    socketClient.on('disconnected', handleDisconnected);
    socketClient.on('error', handleError);

    if (socketClient.isConnected()) {
      joinRoom();
    }

    return () => {
      socketClient.off('connected', handleConnected);
      socketClient.off('disconnected', handleDisconnected);
      socketClient.off('error', handleError);
    };
  }, []);

  // Game event listeners
  useEffect(() => {
    const handleRoomData = (roomData) => {
      setGameState(prev => ({
        ...prev,
        room: roomData,
        players: roomData.players || [],
        currentTurn: roomData.currentTurn,
        gameStatus: roomData.gameState,
        myPlayer: roomData.players?.find(p => p.id === playerId) || null
      }));
    };

    const handleGameStart = (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: GAME_STATES.PLAYING,
        canRoll: data.room.currentTurn === prev.myPlayer?.color,
        messages: [...prev.messages, { type: 'game', text: data.message, timestamp: Date.now() }]
      }));
    };

    const handleDiceRoll = (data) => {
      setGameState(prev => ({
        ...prev,
        diceValue: data.diceValue,
        possibleMoves: data.possibleMoves || [],
        isRolling: false,
        canRoll: false,
        messages: [...prev.messages, {
          type: 'roll',
          text: `${data.playerId === playerId ? 'You' : 'Player'} rolled ${data.diceValue}`,
          timestamp: Date.now()
        }]
      }));
    };

    const handleScoreUpdate = (scoreData) => {
      setGameState(prev => ({
        ...prev,
        scores: scoreData.scores || {},
        leaderboard: scoreData.leaderboard || [],
        gameTime: scoreData.gameTime || 0,
        currentTurn: scoreData.currentTurn || prev.currentTurn
      }));
    };

    socketClient.on('room:data', handleRoomData);
    socketClient.on('game:start', handleGameStart);
    socketClient.on('game:roll', handleDiceRoll);
    socketClient.on('game:scores', handleScoreUpdate);

    return () => {
      socketClient.off('room:data', handleRoomData);
      socketClient.off('game:start', handleGameStart);
      socketClient.off('game:roll', handleDiceRoll);
      socketClient.off('game:scores', handleScoreUpdate);
    };
  }, [playerId]);

  const joinRoom = useCallback(() => {
    if (roomId && playerName && playerId) {
      socketClient.joinRoom(roomId, playerId, playerName);
    }
  }, [roomId, playerName, playerId]);

  const handleReady = () => {
    const newReadyState = !gameState.myPlayer?.isReady;
    socketClient.setReady(newReadyState);
  };

  const handleRollDice = () => {
    if (gameState.canRoll && !gameState.isRolling) {
      setGameState(prev => ({ ...prev, isRolling: true }));
      socketClient.rollDice();
    }
  };

  const handlePawnClick = (playerId, pawnId) => {
    if (gameState.possibleMoves.some(move => move.pawnId === pawnId)) {
      socketClient.movePawn(pawnId);
    }
  };

  const handleLeaveRoom = () => {
    socketClient.leaveRoom();
    socketClient.disconnect();
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              marginRight: '12px',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
          <button 
            onClick={handleLeaveRoom}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #e9ecef', 
            borderTop: '5px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>🔌 Connecting to server...</h2>
          <p>Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px 30px',
        borderRadius: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>🎲 Room: {roomId}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ 
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#667eea',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {gameState.gameStatus.toUpperCase()}
            </span>
            <span>{gameState.players.length}/{gameState.room?.maxPlayers || 4} Players</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {gameState.gameStatus === GAME_STATES.WAITING && (
            <button 
              onClick={handleReady}
              style={{
                background: gameState.myPlayer?.isReady ? '#ffd700' : '#00b894',
                color: gameState.myPlayer?.isReady ? '#2c3e50' : 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {gameState.myPlayer?.isReady ? '✅ Ready' : '⏳ Get Ready'}
            </button>
          )}

          <button 
            onClick={handleLeaveRoom}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🚪 Leave Room
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr 1fr', 
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Left Panel */}
        <div>
          <PlayerList 
            players={gameState.players}
            myPlayerId={playerId}
            currentTurn={gameState.currentTurn}
            gameState={gameState.gameStatus}
          />
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Board
            players={gameState.players}
            onPawnClick={handlePawnClick}
            possibleMoves={gameState.possibleMoves}
            currentPlayer={gameState.players.find(p => p.color === gameState.currentTurn)}
            boardSize={400}
          />

          {gameState.gameStatus === GAME_STATES.PLAYING && (
            <Dice
              value={gameState.diceValue}
              onRoll={handleRollDice}
              disabled={!gameState.canRoll}
              isRolling={gameState.isRolling}
              canRoll={gameState.canRoll}
              currentPlayer={gameState.players.find(p => p.color === gameState.currentTurn)}
            />
          )}
        </div>

        {/* Right Panel */}
        <div>
          <Scoreboard
            scores={gameState.scores}
            leaderboard={gameState.leaderboard}
            gameTime={gameState.gameTime}
            currentTurn={gameState.currentTurn}
            gameState={gameState.gameStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;