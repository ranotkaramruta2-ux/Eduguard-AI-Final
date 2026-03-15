import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`New socket connection: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their notification room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to database
connectDB();

// Server configuration
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
httpServer.listen(PORT, () => {
  logger.success(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🎓 Student Dropout Prediction System API                ║
  ║                                                            ║
  ║   Server running in ${NODE_ENV} mode                 ║
  ║   Port: ${PORT}                                            ║
  ║   URL: http://localhost:${PORT}                            ║
  ║                                                            ║
  ║   API Endpoints:                                           ║
  ║   • Authentication: /api/auth                              ║
  ║   • Students: /api/students                                ║
  ║   • Predictions: /api/predict                              ║
  ║   • Counseling: /api/counseling                            ║
  ║   • Notifications: /api/notifications                      ║
  ║                                                            ║
  ║   Socket.io: Connected ✓                                   ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default httpServer;
