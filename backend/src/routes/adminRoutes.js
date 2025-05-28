"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoutes.ts
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const express_validator_1 = require("express-validator");
const validateMiddleware_1 = require("../middlewares/validateMiddleware");
const router = express_1.default.Router();
/**
 * @route GET /api/admins
 * @desc Get all admins
 * @access Protected (Admin only)
 */
router.get('/', adminController_1.getAllAdmins);
/**
 * @route GET /api/admins/:admin_id
 * @desc Get admin by ID
 * @access Protected (Admin only)
 */
router.get('/:admin_id', adminController_1.getAdminById);
/**
 * @route PUT /api/admins/:admin_id
 * @desc Update admin by ID
 * @access Protected (Admin only)
 */
router.put('/:admin_id', [
    (0, express_validator_1.body)('username').optional().notEmpty().withMessage('Username tidak boleh kosong.'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email tidak valid.'),
    (0, express_validator_1.body)('password').optional().isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
], validateMiddleware_1.validate, adminController_1.updateAdmin);
/**
 * @route DELETE /api/admins/:admin_id
 * @desc Delete admin by ID
 * @access Protected (Admin only)
 */
router.delete('/:admin_id', adminController_1.deleteAdmin);
exports.default = router;
