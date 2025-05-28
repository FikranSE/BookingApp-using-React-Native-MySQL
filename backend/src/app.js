"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.js
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminAuthRoutes_1 = __importDefault(require("./routes/adminAuthRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const transportRoutes_1 = __importDefault(require("./routes/transportRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const transportBookingRoutes_1 = __importDefault(require("./routes/transportBookingRoutes"));
const roomBookingRoutes_1 = __importDefault(require("./routes/roomBookingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const models_1 = require("./models");
const db_1 = __importDefault(require("./config/db"));
const adminAuthMiddleware_1 = require("./middlewares/adminAuthMiddleware");
const errorHandler_1 = require("./middlewares/errorHandler");
// Load environment variables
dotenv_1.default.config();
// Set up server URL for image uploads
const SERVER_URL = process.env.SERVER_URL;
console.log(`Server URL set to: ${SERVER_URL}`);
// Create Express application
const app = (0, express_1.default)();
// Define the uploads directory - IMPORTANT: This must match the path in multerConfig.ts
const uploadsDir = path_1.default.join(__dirname, 'utils', 'uploads');
console.log(`Static files directory configured at: ${uploadsDir}`);
// Basic middleware setup
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Ensure uploads directory exists with proper permissions
if (!fs_1.default.existsSync(uploadsDir)) {
    console.log(`Creating uploads directory at: ${uploadsDir}`);
    try {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        console.log('Uploads directory created successfully');
    }
    catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}
else {
    console.log('Uploads directory already exists');
    // Check if directory is accessible
    try {
        fs_1.default.accessSync(uploadsDir, fs_1.default.constants.R_OK | fs_1.default.constants.W_OK);
        console.log('Uploads directory is readable and writable');
    }
    catch (err) {
        console.error('Uploads directory permissions issue:', err);
    }
}
// Configure static file serving with better error handling
app.use('/uploads', (req, res, next) => {
    console.log(`Static file request: ${req.url}`);
    // Custom error logging for static files
    const filePath = path_1.default.join(uploadsDir, req.url);
    if (fs_1.default.existsSync(filePath)) {
        console.log(`File exists: ${filePath}`);
    }
    else {
        console.log(`File not found: ${filePath}`);
    }
    next();
}, express_1.default.static(uploadsDir, {
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
        const files = fs_1.default.readdirSync(uploadsDir);
        res.json({
            uploadsPath: uploadsDir,
            fileCount: files.length,
            files: files.map(file => ({
                name: file,
                path: path_1.default.join(uploadsDir, file),
                url: `${SERVER_URL}/uploads/${file}`,
                stats: fs_1.default.statSync(path_1.default.join(uploadsDir, file))
            }))
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to read uploads directory', details: err.message });
    }
});
// Database initialization
(0, models_1.initModels)();
// Database synchronization
db_1.default.sync({ force: false }) // Set to true to reset tables (use with caution!)
    .then(() => {
    console.log('Database & tables created!');
})
    .catch((error) => {
    console.error('Error creating database:', error);
});
// API Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default); // User authentication routes
app.use('/api/admins/auth', adminAuthRoutes_1.default); // Admin authentication routes
app.use('/api/admins', adminAuthMiddleware_1.adminAuthMiddleware, adminRoutes_1.default); // Admin routes with auth middleware
app.use('/api/transports', transportRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/transport-bookings', transportBookingRoutes_1.default);
app.use('/api/room-bookings', roomBookingRoutes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.send({
        message: 'API is running',
        version: '1.0.0',
        serverTime: new Date().toISOString(),
        uploadsDirExists: fs_1.default.existsSync(uploadsDir)
    });
});
// Global error handler middleware (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
