import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import counselingRoutes from './routes/counselingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import behaviouralFeedbackRoutes from './routes/behaviouralFeedbackRoutes.js';

/**
 * Initialize Express app
 */
const app = express();

/**
 * Security Middleware
 */
app.use(helmet()); // Set security headers

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression Middleware
 */
app.use(compression());

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI-Based Student Dropout Prediction and Counseling System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      predictions: '/api/predict',
      counseling: '/api/counseling',
      notifications: '/api/notifications',
    },
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/counseling', counselingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/behavioural-feedback', behaviouralFeedbackRoutes);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;
