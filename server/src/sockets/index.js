const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

let _io = null;

// In-memory presence store: Map<projectId, Map<socketId, userPublicData>>
// For multi-instance deployments this would be replaced with Redis Pub/Sub.
const presenceStore = new Map();

/**
 * Returns the socket.io instance.
 * Throws if called before initSocket().
 */
const getSocketIO = () => {
  if (!_io) throw new Error('Socket.IO not initialised');
  return _io;
};

/**
 * Initialise Socket.IO on the HTTP server.
 */
const initSocket = (httpServer) => {
  const { Server } = require('socket.io');

  _io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
    },
    // Ping/pong to detect stale connections
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── JWT Auth Middleware ──────────────────────────────────────────────────────
  _io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('name email avatar');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection Handler ──────────────────────────────────────────────────────
  _io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.user.name})`);

    // ── Join Project Room ────────────────────────────────────────────────────
    socket.on('project:join', (projectId) => {
      if (!projectId) return;

      const room = `project:${projectId}`;
      socket.join(room);
      socket.currentProjectId = projectId;

      // Register presence
      if (!presenceStore.has(projectId)) presenceStore.set(projectId, new Map());
      presenceStore.get(projectId).set(socket.id, socket.user.toPublicJSON());

      // Broadcast updated presence list to everyone in the room
      _io.to(room).emit('presence:update', {
        projectId,
        users: Array.from(presenceStore.get(projectId).values()),
      });

      logger.debug(`${socket.user.name} joined room ${room}`);
    });

    // ── Leave Project Room ───────────────────────────────────────────────────
    socket.on('project:leave', (projectId) => {
      _leaveProject(socket, projectId);
    });

    // ── Typing Indicator ─────────────────────────────────────────────────────
    socket.on('task:typing', ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit('task:typing', {
        user: socket.user.toPublicJSON(),
        taskId,
      });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — ${reason}`);
      if (socket.currentProjectId) {
        _leaveProject(socket, socket.currentProjectId);
      }
    });
  });

  logger.info('Socket.IO initialised');
  return _io;
};

// ── Private Helpers ────────────────────────────────────────────────────────────
const _leaveProject = (socket, projectId) => {
  const room = `project:${projectId}`;
  socket.leave(room);

  const projectPresence = presenceStore.get(projectId);
  if (projectPresence) {
    projectPresence.delete(socket.id);
    if (projectPresence.size === 0) {
      presenceStore.delete(projectId);
    } else {
      _io.to(room).emit('presence:update', {
        projectId,
        users: Array.from(projectPresence.values()),
      });
    }
  }
};

module.exports = { initSocket, getSocketIO };
