import nodemailer from 'nodemailer';

interface EmailOptions {
  html?: string;
  text?: string;
}

class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // GMAIL User
      pass: process.env.GMAIL_PASS, // GMAIL Password (use app password if 2FA is enabled)
    },
  });

  // Method to send email
  public static async sendEmail(
    to: string | string[],
    subject: string,
    text: string,
    options?: EmailOptions
  ): Promise<boolean> {
    try {
      const fromName = process.env.GMAIL_FROM_NAME || 'Booking System';

      // Setup the email options
      const mailOptions = {
        from: `"${fromName}" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text, // Plain text version for email clients that don't render HTML
        ...options // Add the HTML version if available
      };

      // Send email using the transporter
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

export default EmailService;
