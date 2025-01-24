// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import transportRoutes from './transportRoutes';
import roomRoutes from './roomRoutes';
import transportBookingRoutes from './transportBookingRoutes';
import roomBookingRoutes from './roomBookingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admins', adminRoutes);
router.use('/transports', transportRoutes);
router.use('/rooms', roomRoutes);
router.use('/transport-bookings', transportBookingRoutes);
router.use('/room-bookings', roomBookingRoutes);

export default router;
