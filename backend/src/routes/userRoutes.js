"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Memastikan direktori uploads ada
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Konfigurasi multer untuk penanganan file Excel
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Menggunakan direktori yang sudah dipastikan ada
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
// Validasi file Excel yang diupload
const fileFilter = (req, file, cb) => {
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(fileExtension)) {
        cb(null, true);
    }
    else {
        cb(new Error('Format file harus .xlsx atau .xls'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
    }
});
// Public routes
// None for user management
// Protected routes - require authentication
router.get('/profile', authMiddleware_1.default, userController_1.default.getProfile);
router.put('/profile', authMiddleware_1.default, userController_1.default.updateProfile);
// Admin routes - require admin role
router.get('/', authMiddleware_1.default, adminMiddleware_1.default, userController_1.default.getAll);
router.get('/:id', authMiddleware_1.default, adminMiddleware_1.default, userController_1.default.getById);
router.post('/', authMiddleware_1.default, adminMiddleware_1.default, userController_1.default.create);
router.put('/:id', authMiddleware_1.default, userController_1.default.update); // With permission check inside
router.delete('/:id', authMiddleware_1.default, adminMiddleware_1.default, userController_1.default.delete);
// Import user dari Excel - hanya admin
router.post('/import', authMiddleware_1.default, adminMiddleware_1.default, upload.single('excelFile'), userController_1.default.importFromExcel);
exports.default = router;
