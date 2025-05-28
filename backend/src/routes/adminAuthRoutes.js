"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminAuthRoutes.ts
const express_1 = __importDefault(require("express"));
const adminAuthController_1 = require("../controllers/adminAuthController");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validateMiddleware_1 = require("../middlewares/validateMiddleware");
const adminAuthMiddleware_1 = require("../middlewares/adminAuthMiddleware");
const router = express_1.default.Router();
// Rate limiter untuk login Admin
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimal 5 permintaan per IP
    message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Validasi dan rate limiter untuk registrasi Admin
router.post('/register', [
    (0, express_validator_1.body)('username').notEmpty().withMessage('Username tidak boleh kosong.'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email tidak valid.'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
], validateMiddleware_1.validate, adminAuthController_1.adminRegister);
// Validasi dan rate limiter untuk login Admin
router.post('/login', loginLimiter, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email tidak valid.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password tidak boleh kosong.'),
], validateMiddleware_1.validate, adminAuthController_1.adminLogin);
// UPDATED: Apply middleware to ensure admin_id is available for the profile update
router.put('/profile', adminAuthMiddleware_1.profileAuthMiddleware, // Use the dedicated middleware for profile
[
    (0, express_validator_1.body)('username').optional().notEmpty().withMessage('Username tidak boleh kosong.'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email tidak valid.'),
    (0, express_validator_1.body)('password').optional().isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
], validateMiddleware_1.validate, adminAuthController_1.editProfile);
exports.default = router;
