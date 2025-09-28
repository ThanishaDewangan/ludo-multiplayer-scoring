import React, { useState, useEffect } from 'react';
import GameRoom from './components/GameRoom';
import { generatePlayerId, generateRoomId } from './utils/gameConstants';
import axios from 'axios';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'game'
  const [gameData, setGameData] = useState({
    roomId: '',
    playerName: '',
    playerId: generatePlayerId()
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentView === 'home') {
      fetchAvailableRooms();
    }
  }, [currentView]);

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setAvailableRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (roomName, playerName) => {
    if (!roomName.trim() || !playerName.trim()) {
      setError('Please enter both room name and your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create room
      const roomResponse = await axios.post('/api/rooms', {
        name: roomName,
        maxPlayers: 4,
        createdBy: gameData.playerId
      });

      const roomId = roomResponse.data.id;

      // Join the room
      await axios.post(`/api/rooms/${roomId}/join`, {
        playerName: playerName,
        playerId: gameData.playerId,
        socketId: 'temp' // Will be updated by socket connection
      });

      setGameData({
        ...gameData,
        roomId: roomId,
        playerName: playerName
      });

      setCurrentView('game');
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId, playerName) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`/api/rooms/${roomId}/join`, {
        playerName: playerName,
        playerId: gameData.playerId,
        socketId: 'temp'
      });

      setGameData({
        ...gameData,
        roomId: roomId,
        playerName: playerName
      });

      setCurrentView('game');
    } catch (error) {
      console.error('Error joining room:', error);
      setError(error.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentView('home');
    setGameData({
      ...gameData,
      roomId: '',
      playerName: ''
    });
    setError('');
    fetchAvailableRooms();
  };

  if (currentView === 'game') {
    return (
      <GameRoom
        roomId={gameData.roomId}
        playerName={gameData.playerName}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">🎲 Ludo Multiplayer</h1>
          <p className="app-subtitle">Real-Time Scoring System</p>
          <div className="app-description">
            <p>Experience the classic Ludo game with a unique scoring system!</p>
            <div className="scoring-preview">
              <span>🎯 +1 point per step</span>
              <span>⚔️ Capture = Gain opponent's score</span>
              <span>🏠 Home = +56 bonus</span>
              <span>🏆 Highest score wins!</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <main className="app-main">
          <div className="game-options">
            <CreateRoomForm
              onCreateRoom={handleCreateRoom}
              loading={loading}
            />

            <div className="divider">
              <span>OR</span>
            </div>

            <JoinRoomForm
              availableRooms={availableRooms}
              onJoinRoom={handleJoinRoom}
              loading={loading}
              onRefreshRooms={fetchAvailableRooms}
            />
          </div>
        </main>

        <footer className="app-footer">
          <p>Built for QreateAI Full Stack Developer Intern Assessment</p>
          <div className="tech-stack">
            <span>🔧 MERN Stack</span>
            <span>⚡ Socket.IO</span>
            <span>🎮 Real-time Gaming</span>
            <span>📱 Responsive</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Create Room Form Component
const CreateRoomForm = ({ onCreateRoom, loading }) => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(roomName, playerName);
  };

  return (
    <div className="game-option create-room">
      <h2>🏠 Create New Room</h2>
      <form onSubmit={handleSubmit} className="room-form">
        <div className="input-group">
          <label htmlFor="roomName">Room Name</label>
          <input
            id="roomName"
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            maxLength={30}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            disabled={loading}
          />
        </div>

        <button type="submit" className="create-button" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Creating...
            </>
          ) : (
            <>
              🎯 Create & Join Room
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Join Room Form Component
const JoinRoomForm = ({ availableRooms, onJoinRoom, loading, onRefreshRooms }) => {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoomId) {
      onJoinRoom(selectedRoomId, playerName);
    }
  };

  return (
    <div className="game-option join-room">
      <div className="join-header">
        <h2>🚪 Join Existing Room</h2>
        <button 
          className="refresh-button"
          onClick={onRefreshRooms}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {availableRooms.length > 0 ? (
        <form onSubmit={handleSubmit} className="room-form">
          <div className="input-group">
            <label htmlFor="roomSelect">Available Rooms</label>
            <select
              id="roomSelect"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a room...</option>
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.currentPlayers}/{room.maxPlayers} players)
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="joinPlayerName">Your Name</label>
            <input
              id="joinPlayerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              disabled={loading}
            />
          </div>

          <button type="submit" className="join-button" disabled={loading || !selectedRoomId}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Joining...
              </>
            ) : (
              <>
                🎮 Join Room
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="no-rooms">
          <div className="no-rooms-icon">🏠</div>
          <p>No rooms available right now.</p>
          <p>Create a new room to start playing!</p>
        </div>
      )}
    </div>
  );
};

export default App;