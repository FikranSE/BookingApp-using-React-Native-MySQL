// app.js
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminRoutes from './routes/adminRoutes';
import transportRoutes from './routes/transportRoutes';
import roomRoutes from './routes/roomRoutes';
import transportBookingRoutes from './routes/transportBookingRoutes';
import roomBookingRoutes from './routes/roomBookingRoutes';
import userRoutes from './routes/userRoutes';
import { initModels } from './models';
import sequelize from './config/db';
import { adminAuthMiddleware } from './middlewares/adminAuthMiddleware';
import { errorHandler } from './middlewares/errorHandler'; 

// Load environment variables
dotenv.config();

// Set up server URL for image uploads
const SERVER_URL = process.env.SERVER_URL;
console.log(`Server URL set to: ${SERVER_URL}`);

// Create Express application
const app: Application = express();

// Define the uploads directory - IMPORTANT: This must match the path in multerConfig.ts
const uploadsDir = path.join(__dirname, 'utils', 'uploads');
console.log(`Static files directory configured at: ${uploadsDir}`);

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists with proper permissions
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at: ${uploadsDir}`);
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('Uploads directory created successfully');
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
} else {
  console.log('Uploads directory already exists');
  // Check if directory is accessible
  try {
    fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Uploads directory is readable and writable');
  } catch (err) {
    console.error('Uploads directory permissions issue:', err);
  }
}

// Configure static file serving with better error handling
app.use('/uploads', (req, res, next) => {
  console.log(`Static file request: ${req.url}`);
  // Custom error logging for static files
  const filePath = path.join(uploadsDir, req.url);
  if (fs.existsSync(filePath)) {
    console.log(`File exists: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
  next();
}, express.static(uploadsDir, {
  fallthrough: true,
  setHeaders: (res) => {
    // Disable caching for development
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Add a diagnostic endpoint to list files in the uploads directory
app.get('/api/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      uploadsPath: uploadsDir,
      fileCount: files.length,
      files: files.map(file => ({
        name: file,
        path: path.join(uploadsDir, file),
        url: `${SERVER_URL}/uploads/${file}`,
        stats: fs.statSync(path.join(uploadsDir, file))
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read uploads directory', details: err.message });
  }
});

// Database initialization
initModels();

// Database synchronization
sequelize.sync({ force: false }) // Set to true to reset tables (use with caution!)
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((error) => {
    console.error('Error creating database:', error);
  });

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // User authentication routes
app.use('/api/admins/auth', adminAuthRoutes); // Admin authentication routes
app.use('/api/admins', adminAuthMiddleware, adminRoutes); // Admin routes with auth middleware
app.use('/api/transports', transportRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/transport-bookings', transportBookingRoutes);
app.use('/api/room-bookings', roomBookingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'API is running',
    version: '1.0.0',
    serverTime: new Date().toISOString(),
    uploadsDirExists: fs.existsSync(uploadsDir)
  });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

export default app;