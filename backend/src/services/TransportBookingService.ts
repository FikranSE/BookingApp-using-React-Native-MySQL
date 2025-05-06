import { TransportBooking, User } from "../models";
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
      
      // Get the booking with a JOIN to the user table
      const booking = await TransportBooking.findOne({
        where: { booking_id: bookingId },
        include: [{
          model: User,
          as: 'user', // Add the correct alias here (matching your model association)
          attributes: ['email']
        }]
      });
      
      if (!booking) {
        console.log(`Transport booking with ID ${bookingId} not found`);
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
      
      console.log(`No email found for transport booking ID: ${bookingId}`);
      return null;
    } catch (error) {
      console.error(`Error getting user email for transport booking: ${error.message}`, error);
      return null;
    }
  }

  public static async sendEmail(to: string | string[], subject: string, body: string): Promise<boolean> {
    try {
      // Clean body content to ensure no unwanted characters
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
                  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #777;">This is an automated notification from the Transport Booking System.</p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
  
      // Provide a plain-text version for email clients that don't support HTML
      const plainTextBody = `
        ${subject}
  
        ${body}
  
        This is an automated notification from the Transport Booking System.
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
}

export default TransportBookingService;