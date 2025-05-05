import nodemailer from 'nodemailer';

interface EmailOptions {
  html?: string;
}

class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // GMAIL User
      pass: process.env.GMAIL_PASS, // GMAIL Password (gunakan app password jika 2FA diaktifkan)
    },
  });

  // Metode untuk mengirim email
  public static async sendEmail(
    to: string | string[],
    subject: string,
    text: string,
    options?: EmailOptions
  ): Promise<boolean> {
    try {
      const fromName = process.env.GMAIL_FROM_NAME || 'Booking System';
      
      const mailOptions = {
        from: `"${fromName}" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        ...options
      };
      
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
