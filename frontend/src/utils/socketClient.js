import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000') {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server:', this.socket.id);
      this.connected = true;
      this.emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.connected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    // Game event listeners
    this.setupGameListeners();

    return this.socket;
  }

  setupGameListeners() {
    // Room events
    this.socket.on('room:data', (data) => {
      this.emit('room:data', data);
    });

    // Game events
    this.socket.on('game:start', (data) => {
      this.emit('game:start', data);
    });

    this.socket.on('game:roll', (data) => {
      this.emit('game:roll', data);
    });

    this.socket.on('game:move', (data) => {
      this.emit('game:move', data);
    });

    this.socket.on('game:turn', (data) => {
      this.emit('game:turn', data);
    });

    // Scoring events
    this.socket.on('game:scores', (data) => {
      this.emit('game:scores', data);
    });

    this.socket.on('game:winner', (data) => {
      this.emit('game:winner', data);
    });
  }

  // Event management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Room methods
  joinRoom(roomId, playerId, playerName) {
    if (this.socket) {
      this.socket.emit('room:join', { roomId, playerId, playerName });
    }
  }

  leaveRoom() {
    if (this.socket) {
      this.socket.emit('room:leave');
    }
  }

  setReady(isReady) {
    if (this.socket) {
      this.socket.emit('player:ready', { isReady });
    }
  }

  // Game methods
  rollDice() {
    if (this.socket) {
      this.socket.emit('game:roll');
    }
  }

  movePawn(pawnId) {
    if (this.socket) {
      this.socket.emit('game:move', { pawnId });
    }
  }

  // Utility methods
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;