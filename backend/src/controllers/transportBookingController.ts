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
      const bookingId = Number(req.params.id);
      const updateData = req.body;

      console.log(`Updating transport booking ${bookingId} to status: ${updateData.status}`);
      const updatedBooking = await TransportBookingService.updateBooking(bookingId, updateData);

      if (updatedBooking) {
        let userEmail = await TransportBookingService.getUserEmailByBookingId(bookingId);

        if (userEmail) {
          const subject = `Transport Booking Status: ${updateData.status.toUpperCase()}`;
          const body = `Dear User,\n\nYour booking for Transport #${updatedBooking.transport_id} on ${new Date(updatedBooking.booking_date).toLocaleDateString()} has been ${updateData.status.toLowerCase()}.\n\nThank you for using our booking system.`;

          console.log("Email parameters:", { to: userEmail, subject, bodyPreview: body.substring(0, 50) + "..." });

          const emailResult = await TransportBookingService.sendEmail(userEmail, subject, body);
          console.log(`Email sending result: ${emailResult ? "SUCCESS" : "FAILED"}`);

          return res.status(200).json({
            ...updatedBooking.toJSON(),
            emailSent: emailResult,
            emailRecipient: userEmail
          });
        } else {
          console.warn(`No email address found for transport booking ${bookingId}`);
          return res.status(200).json({
            ...updatedBooking.toJSON(),
            emailSent: false,
            emailError: "No email address found"
          });
        }
      } else {
        return res.status(404).json({ error: "Booking not found" });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      return res.status(500).json({
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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