import { RoomBooking, User } from "../models";
import nodemailer from "nodemailer";
import EmailService from './EmailService';

class RoomBookingService {
  public static async createBooking(data: Partial<RoomBooking>): Promise<RoomBooking> {
    return RoomBooking.create(data);
  }

  public static async getAllBookings(): Promise<RoomBooking[]> {
    return RoomBooking.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    });
  }

  public static async getBookingById(id: number): Promise<RoomBooking | null> {
    return RoomBooking.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    });
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
      // Clean body content to ensure no unwanted characters are included
      const cleanBody = body.replace(/\n/g, '<br>');
  
      // Create the HTML email content
      const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
              <tr>
                <td>
                  <h2 style="color: #333;">${subject}</h2>
                  <div style="font-size: 16px; line-height: 1.5; color: #555;">
                    ${cleanBody}
                  </div>
                  ${body.includes('Notes:') ? `
                  <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                    <p style="margin: 0; color: #0f172a; font-weight: 500;">Notes from Administrator:</p>
                    <p style="margin: 10px 0 0 0; color: #475569;">${body.split('Notes:')[1].trim()}</p>
                  </div>
                  ` : ''}
                  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #777;">This is an automated notification from the Booking System.</p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
  
      // Provide a plain-text version for email clients that do not support HTML
      const plainTextBody = `
        ${subject}
  
        ${body}
  
        This is an automated notification from the Booking System.
      `;
  
      // Send the email using the EmailService
      const emailResult = await EmailService.sendEmail(to, subject, plainTextBody, {
        html: htmlBody,  // HTML email version
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