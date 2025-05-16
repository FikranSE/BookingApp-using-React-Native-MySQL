// multerConfig.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get server URL from environment variables or use a default
const SERVER_URL = process.env.SERVER_URL || 'https://j9d3hc82-3001.asse.devtunnels.ms';

// IMPORTANT: This path must match the one in app.js
// Use the same path pattern as in app.js (directly in the src directory, not in src/uploads)
const uploadsDir = path.join(__dirname, 'uploads');
console.log(`Multer config - uploads directory: ${uploadsDir}`);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log(`Multer - creating uploads directory at: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Multer - saving file to: ${uploadsDir}`);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log(`Multer - generated filename: ${filename}`);
    cb(null, filename);
  }
});

// File filter to ensure only images are uploaded
const fileFilter = (req: any, file: any, cb: any) => {
  console.log(`Multer - received file: ${file.originalname}, mimetype: ${file.mimetype}`);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter, 
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Log multer configuration on module load
console.log(`Multer configured - allowed file size: 5MB, upload path: ${uploadsDir}`);

export default upload;