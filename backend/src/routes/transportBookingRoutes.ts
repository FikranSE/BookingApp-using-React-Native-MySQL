// src/routes/transportBookingRoutes.ts
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import TransportBookingController from '../controllers/transportBookingController';

const router = Router();

router.post('/', authMiddleware, TransportBookingController.createBooking);
router.get('/', authMiddleware, TransportBookingController.getAllBookings);
router.get('/:id', authMiddleware, TransportBookingController.getBookingById);
router.put('/:id', authMiddleware, TransportBookingController.updateBooking);
router.delete('/:id', authMiddleware, adminMiddleware, TransportBookingController.deleteBooking);

export default router;
