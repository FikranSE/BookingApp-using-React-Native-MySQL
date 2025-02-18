// src/controllers/TransportBookingController.ts
import { Request, Response } from 'express';
import TransportBookingService from '../services/TransportBookingService';

class TransportBookingController {
  public static async createBooking(req: Request, res: Response) {
    try {
      const booking = await TransportBookingService.createBooking({
        ...req.body,
        user_id: (req as any).user.id,
      });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await TransportBookingService.getAllBookings();
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getBookingById(req: Request, res: Response) {
    try {
      const booking = await TransportBookingService.getBookingById(Number(req.params.id));
      if (booking) {
        res.status(200).json(booking);
      } else {
        res.status(404).json({ error: 'Booking not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async updateBooking(req: Request, res: Response) {
    try {
      const updatedBooking = await TransportBookingService.updateBooking(Number(req.params.id), req.body);
      if (updatedBooking) {
        res.status(200).json(updatedBooking);
      } else {
        res.status(404).json({ error: 'Booking not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async deleteBooking(req: Request, res: Response) {
    try {
      const deleted = await TransportBookingService.deleteBooking(Number(req.params.id));
      if (deleted) {
        res.status(200).json({ message: 'Booking deleted successfully' });
      } else {
        res.status(404).json({ error: 'Booking not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default TransportBookingController;
