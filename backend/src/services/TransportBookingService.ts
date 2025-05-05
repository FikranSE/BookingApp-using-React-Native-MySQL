import { TransportBooking, User } from "../models";
import nodemailer from "nodemailer";
import EmailService from './EmailService';
class TransportBookingService {
  public static async createBooking(data: Partial<TransportBooking>): Promise<TransportBooking> {
    return TransportBooking.create(data);
  }

  public static async getAllBookings(): Promise<TransportBooking[]> {
    return TransportBooking.findAll();
  }

  public static async getBookingById(id: number): Promise<TransportBooking | null> {
    return TransportBooking.findByPk(id);
  }

  public static async updateBooking(id: number, data: Partial<TransportBooking>) {
    const [affectedCount] = await TransportBooking.update(data, {
      where: { booking_id: id }
    });

    if (affectedCount > 0) {
      const updatedBooking = await TransportBooking.findByPk(id);
      return updatedBooking;
    }

    return null;
  }

  public static async deleteBooking(id: number): Promise<number> {
    return TransportBooking.destroy({ where: { booking_id: id } });
  }

  public static async getUserEmailByBookingId(bookingId: number): Promise<string | null> {
    try {
      console.log(`Getting user email for transport booking ID: ${bookingId}`);
      
      // Ambil booking dengan JOIN ke tabel user
      const booking = await TransportBooking.findOne({
        where: { booking_id: bookingId },
        include: [{
          model: User,
          attributes: ['email'] // Hanya ambil kolom email
        }]
      });
      
      if (!booking) {
        console.log(`Transport booking with ID ${bookingId} not found`);
        return null;
      }
      
      // Dapatkan email dari relasi user
      if (booking.user && booking.user.email) {
        console.log(`Found email from user relation: ${booking.user.email}`);
        return booking.user.email;
      }
      
      // Jika tidak ada relasi, coba ambil langsung dari tabel user
      if (booking.user_id) {
        const user = await User.findByPk(booking.user_id);
        if (user && user.email) {
          console.log(`Found email by user ID lookup: ${user.email}`);
          return user.email;
        }
      }
      
      console.log(`No email found for transport booking ID: ${bookingId}`);
      return null;
    } catch (error) {
      console.error(`Error getting user email for transport booking: ${error.message}`, error);
      return null;
    }
  }

  // Gunakan metode sendEmail yang sama seperti di RoomBookingService
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
            <p style="font-size: 14px; color: #777;">This is an automated notification for your transport booking.</p>
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

export default TransportBookingService;