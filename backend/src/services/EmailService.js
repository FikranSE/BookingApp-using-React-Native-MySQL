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
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    // Method to send email
    static sendEmail(to, subject, text, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fromName = process.env.GMAIL_FROM_NAME || 'Booking System';
                // Setup the email options
                const mailOptions = Object.assign({ from: `"${fromName}" <${process.env.GMAIL_USER}>`, to: to, subject: subject, text: text }, options // Add the HTML version if available
                );
                // Send email using the transporter
                const info = yield this.transporter.sendMail(mailOptions);
                console.log('Email sent:', info.messageId);
                return true;
            }
            catch (error) {
                console.error('Error sending email:', error);
                return false;
            }
        });
    }
}
EmailService.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // GMAIL User
        pass: process.env.GMAIL_PASS, // GMAIL Password (use app password if 2FA is enabled)
    },
});
exports.default = EmailService;
