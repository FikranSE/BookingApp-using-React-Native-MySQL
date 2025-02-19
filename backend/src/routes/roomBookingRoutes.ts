// src/routes/roomBookingRoutes.ts
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import RoomBookingController from '../controllers/roomBookingController';

const router = Router();

router.post('/', authMiddleware, RoomBookingController.createBooking);
router.get('/', authMiddleware, RoomBookingController.getAllBookings);
router.get('/:id', authMiddleware, RoomBookingController.getBookingById);
router.put('/:id', authMiddleware, RoomBookingController.updateBooking);
router.delete('/:id', authMiddleware, adminMiddleware, RoomBookingController.deleteBooking);

export default router;
