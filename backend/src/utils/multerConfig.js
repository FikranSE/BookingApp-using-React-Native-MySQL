"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// multerConfig.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Get server URL from environment variables or use a default
const SERVER_URL = process.env.SERVER_URL;
// IMPORTANT: This path must match the one in app.js
// Use the same path pattern as in app.js (directly in the src directory, not in src/uploads)
const uploadsDir = path_1.default.join(__dirname, 'uploads');
console.log(`Multer config - uploads directory: ${uploadsDir}`);
// Ensure uploads directory exists
if (!fs_1.default.existsSync(uploadsDir)) {
    console.log(`Multer - creating uploads directory at: ${uploadsDir}`);
    fs_1.default.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Multer - saving file to: ${uploadsDir}`);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const filename = uniqueSuffix + ext;
        console.log(`Multer - generated filename: ${filename}`);
        cb(null, filename);
    }
});
// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    console.log(`Multer - received file: ${file.originalname}, mimetype: ${file.mimetype}`);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'), false);
    }
};
// Create multer upload instance
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
// Log multer configuration on module load
console.log(`Multer configured - allowed file size: 5MB, upload path: ${uploadsDir}`);
exports.default = upload;
