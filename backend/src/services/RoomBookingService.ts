import { RoomBooking, User } from "../models";
import nodemailer from "nodemailer";
import EmailService from './EmailService';

class RoomBookingService {
  public static async createBooking(data: Partial<RoomBooking>): Promise<RoomBooking> {
    return RoomBooking.create(data);
  }

  public static async getAllBookings(): Promise<RoomBooking[]> {
    return RoomBooking.findAll();
  }

  public static async getBookingById(id: number): Promise<RoomBooking | null> {
    return RoomBooking.findByPk(id);
  }

  public static async updateBooking(id: number, data: Partial<RoomBooking>) {
    const [affectedCount] = await RoomBooking.update(data, {
      where: { booking_id: id },
    });

    if (affectedCount > 0) {
      const updatedBooking = await RoomBooking.findByPk(id);
      return updatedBooking;
    }

    return null;
  }

  public static async deleteBooking(id: number): Promise<number> {
    return RoomBooking.destroy({ where: { booking_id: id } });
  }

  public static async getUserEmailByBookingId(bookingId: number): Promise<string | null> {
    try {
      console.log(`Getting user email for booking ID: ${bookingId}`);
      
      // Get the booking (adjust the alias if needed)
      const booking = await RoomBooking.findOne({
        where: { booking_id: bookingId },
        include: [{
          model: User,
          as: 'user', // Add the correct alias here
          attributes: ['email']
        }]
      });
      
      if (!booking) {
        console.log(`Booking with ID ${bookingId} not found`);
        return null;
      }
      
      // Get email from user relation
      if (booking.user && booking.user.email) {
        console.log(`Found email from user relation: ${booking.user.email}`);
        return booking.user.email;
      }
      
      // If no relation, try direct user lookup
      if (booking.user_id) {
        const user = await User.findByPk(booking.user_id);
        if (user && user.email) {
          console.log(`Found email by user ID lookup: ${user.email}`);
          return user.email;
        }
      }
      
      console.log(`No email found for booking ID: ${bookingId}`);
      return null;
    } catch (error) {
      console.error(`Error getting user email: ${error.message}`, error);
      return null;
    }
  }

  // Dalam RoomBookingService.ts - ganti metode sendEmail
  public static async sendEmail(to: string | string[], subject: string, body: string): Promise<boolean> {
    try {
      const emailResult = await EmailService.sendEmail(to, subject, body, {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">${subject}</h2>
            <div style="font-size: 16px; line-height: 1.5; color: #555;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #777;">This is an automated notification for your room booking.</p>
            </div>
          </div>
        `
      });

      return emailResult;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

// Dalam TransportBookingService.ts - ganti metode sendEmail dengan cara yang sama
}

export default RoomBookingService;