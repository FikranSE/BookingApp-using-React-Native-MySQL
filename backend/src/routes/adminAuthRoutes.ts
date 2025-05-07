// src/routes/adminAuthRoutes.ts
import express from 'express';
import { adminLogin, adminRegister, editProfile } from '../controllers/adminAuthController';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validateMiddleware';
import { profileAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router = express.Router();

// Rate limiter untuk login Admin
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 permintaan per IP
  message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validasi dan rate limiter untuk registrasi Admin
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username tidak boleh kosong.'),
    body('email').isEmail().withMessage('Email tidak valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
  ],
  validate,
  adminRegister
);

// Validasi dan rate limiter untuk login Admin
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email tidak valid.'),
    body('password').notEmpty().withMessage('Password tidak boleh kosong.'),
  ],
  validate,
  adminLogin
);

// UPDATED: Apply middleware to ensure admin_id is available for the profile update
router.put(
  '/profile',
  profileAuthMiddleware, // Use the dedicated middleware for profile
  [
    body('username').optional().notEmpty().withMessage('Username tidak boleh kosong.'),
    body('email').optional().isEmail().withMessage('Email tidak valid.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
  ],
  validate,
  editProfile
);

export default router;