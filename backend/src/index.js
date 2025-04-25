import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import reportRoutes from './routes/reportRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import legalRoutes from './routes/legalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import educationalContentRoutes from './routes/educationalContentRoutes.js';
import legalResourceRoutes from './routes/legalResourceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import authoritiesRoutes from './routes/authorityRoutes.js';
// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow file downloads
}));

// Rate limiting with higher limits for file uploads
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiting to all routes except file uploads
app.use((req, res, next) => {
  if (req.path.startsWith('/api/files/upload')) {
    next();
  } else {
    limiter(req, res, next);
  }
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5
    });

    // Wait for the connection to be ready
    await mongoose.connection.db.admin().ping();
    console.log('Connected to MongoDB');
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Initialize MongoDB connection before starting the server
connectDB().then((conn) => {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/legal', legalRoutes);
  app.use('/api/educational-content', educationalContentRoutes);
  app.use('/api/legal-resources', legalResourceRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/forum', forumRoutes);
  app.use('/api/authorities', authoritiesRoutes);
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (err.code === 'ECONNRESET') {
      return res.status(500).json({ 
        message: 'Connection was reset. Please try again.',
        code: 'CONNECTION_RESET'
      });
    }
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Set server timeouts
  server.setTimeout(60000); // 60 seconds
  server.keepAliveTimeout = 60000;
}); 