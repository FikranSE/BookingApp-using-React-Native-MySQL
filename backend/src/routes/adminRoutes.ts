// src/routes/adminRoutes.ts
import express from 'express';
import { getAllAdmins, getAdminById, updateAdmin, deleteAdmin } from '../controllers/adminController';
import { body } from 'express-validator';
import { validate } from '../middlewares/validateMiddleware';

const router = express.Router();

/**
 * @route GET /api/admins
 * @desc Get all admins
 * @access Protected (Admin only)
 */
router.get('/', getAllAdmins);

/**
 * @route GET /api/admins/:admin_id
 * @desc Get admin by ID
 * @access Protected (Admin only)
 */
router.get('/:admin_id', getAdminById);

/**
 * @route PUT /api/admins/:admin_id
 * @desc Update admin by ID
 * @access Protected (Admin only)
 */
router.put(
  '/:admin_id',
  [
    body('username').optional().notEmpty().withMessage('Username tidak boleh kosong.'),
    body('email').optional().isEmail().withMessage('Email tidak valid.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password harus minimal 6 karakter.'),
  ],
  validate,
  updateAdmin
);

/**
 * @route DELETE /api/admins/:admin_id
 * @desc Delete admin by ID
 * @access Protected (Admin only)
 */
router.delete('/:admin_id', deleteAdmin);

export default router;
