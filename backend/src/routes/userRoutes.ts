// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

// Memastikan direktori uploads ada
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer untuk penanganan file Excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Menggunakan direktori yang sudah dipastikan ada
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Validasi file Excel yang diupload
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (['.xlsx', '.xls'].includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Format file harus .xlsx atau .xls'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
  }
});

// Public routes
// None for user management

// Protected routes - require authentication
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);

// Admin routes - require admin role
router.get('/', authMiddleware, adminMiddleware, UserController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, UserController.getById);
router.post('/', authMiddleware, adminMiddleware, UserController.create);
router.put('/:id', authMiddleware, UserController.update); // With permission check inside
router.delete('/:id', authMiddleware, adminMiddleware, UserController.delete);

// Import user dari Excel - hanya admin
router.post('/import', 
  authMiddleware, 
  adminMiddleware, 
  upload.single('excelFile'), 
  UserController.importFromExcel
);

export default router;