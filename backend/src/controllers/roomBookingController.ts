// src/controllers/RoomBookingController.ts
import { Request, Response } from 'express';
import RoomBookingService from '../services/RoomBookingService';

class RoomBookingController {
  public static async createBooking(req: Request, res: Response) {
    try {
      const booking = await RoomBookingService.createBooking({
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
      const bookings = await RoomBookingService.getAllBookings();
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getBookingById(req: Request, res: Response) {
    try {
      const booking = await RoomBookingService.getBookingById(Number(req.params.id));
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
      const updatedBooking = await RoomBookingService.updateBooking(Number(req.params.id), req.body);
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
      const deleted = await RoomBookingService.deleteBooking(Number(req.params.id));
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

export default RoomBookingController;
