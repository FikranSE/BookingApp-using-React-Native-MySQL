// src/routes/roomRoutes.ts
import { Router } from 'express';
import RoomController from '../controllers/RoomController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, RoomController.createRoom);
router.get('/', authMiddleware, RoomController.getAllRooms);
router.get('/:id', authMiddleware, RoomController.getRoomById);
router.put('/:id', authMiddleware, adminMiddleware, RoomController.updateRoom);
router.delete('/:id', authMiddleware, adminMiddleware, RoomController.deleteRoom);

export default router;
