"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const EmailService_1 = __importDefault(require("./EmailService"));
class TransportBookingService {
    static createBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.TransportBooking.create(data);
        });
    }
    static getAllBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.TransportBooking.findAll({
                include: [{
                        model: models_1.User,
                        as: 'user',
                        attributes: ['email']
                    }]
            });
        });
    }
    static getBookingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.TransportBooking.findByPk(id, {
                include: [{
                        model: models_1.User,
                        as: 'user',
                        attributes: ['email']
                    }]
            });
        });
    }
    static updateBooking(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [affectedCount] = yield models_1.TransportBooking.update(data, {
                where: { booking_id: id }
            });
            if (affectedCount > 0) {
                const updatedBooking = yield models_1.TransportBooking.findByPk(id);
                return updatedBooking;
            }
            return null;
        });
    }
    static deleteBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.TransportBooking.destroy({ where: { booking_id: id } });
        });
    }
    static getUserEmailByBookingId(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Getting user email for transport booking ID: ${bookingId}`);
                // Get the booking with a JOIN to the user table
                const booking = yield models_1.TransportBooking.findOne({
                    where: { booking_id: bookingId },
                    include: [{
                            model: models_1.User,
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
                    const user = yield models_1.User.findByPk(booking.user_id);
                    if (user && user.email) {
                        console.log(`Found email by user ID lookup: ${user.email}`);
                        return user.email;
                    }
                }
                console.log(`No email found for transport booking ID: ${bookingId}`);
                return null;
            }
            catch (error) {
                console.error(`Error getting user email for transport booking: ${error.message}`, error);
                return null;
            }
        });
    }
    static sendEmail(to, subject, body) {
        return __awaiter(this, void 0, void 0, function* () {
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
                  ${body.includes('Notes:') ? `
                  <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                    <p style="margin: 0; color: #0f172a; font-weight: 500;">Notes from Administrator:</p>
                    <p style="margin: 10px 0 0 0; color: #475569;">${body.split('Notes:')[1].trim()}</p>
                  </div>
                  ` : ''}
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
                const emailResult = yield EmailService_1.default.sendEmail(to, subject, plainTextBody, {
                    html: htmlBody, // HTML email version
                });
                return emailResult;
            }
            catch (error) {
                console.error("Error sending email:", error);
                return false;
            }
        });
    }
}
exports.default = TransportBookingService;
