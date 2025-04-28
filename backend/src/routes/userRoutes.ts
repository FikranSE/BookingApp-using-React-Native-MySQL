// backend/src/routes/userRoutes.ts

import { Router } from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';

const router = Router();

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

export default router;