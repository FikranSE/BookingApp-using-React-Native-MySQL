// src/routes/roomBookingRoutes.ts
import { Router } from 'express';
import combinedAuthMiddleware from '../middlewares/combinedAuthMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import RoomBookingController from '../controllers/roomBookingController';

const router = Router();

router.post('/', combinedAuthMiddleware, RoomBookingController.createBooking);

router.get('/', combinedAuthMiddleware, RoomBookingController.getAllBookings);

router.get('/:id', combinedAuthMiddleware, RoomBookingController.getBookingById);

router.put('/:id', combinedAuthMiddleware, RoomBookingController.updateBooking);

router.delete('/:id', adminMiddleware, RoomBookingController.deleteBooking);

export default router;
 