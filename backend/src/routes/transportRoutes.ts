// src/routes/transportRoutes.ts
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import TransportController from '../controllers/transportController';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, TransportController.createTransport);
router.get('/', authMiddleware, TransportController.getAllTransports);
router.get('/:id', authMiddleware, TransportController.getTransportById);
router.put('/:id', authMiddleware, adminMiddleware, TransportController.updateTransport);
router.delete('/:id', authMiddleware, adminMiddleware, TransportController.deleteTransport);

export default router;
