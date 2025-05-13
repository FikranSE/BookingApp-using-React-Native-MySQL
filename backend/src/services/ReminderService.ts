import { RoomBooking, TransportBooking, User } from "../models";
import EmailService from './EmailService';
import { Op } from 'sequelize';

class ReminderService {
  // Schedule reminders for all upcoming bookings
  public static async scheduleReminders() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Get room bookings that need reminders
      const roomBookings = await RoomBooking.findAll({
        where: {
          status: 'approved',
          booking_date: {
            [Op.gte]: now,
            [Op.lte]: oneHourFromNow
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['email']
        }]
      });

      // Get transport bookings that need reminders
      const transportBookings = await TransportBooking.findAll({
        where: {
          status: 'approved',
          booking_date: {
            [Op.gte]: now,
            [Op.lte]: oneHourFromNow
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['email']
        }]
      });

      // Send reminders for room bookings
      for (const booking of roomBookings) {
        if (booking.user?.email) {
          const subject = `Reminder: Room Booking #${booking.room_id} in 1 hour`;
          const body = `Dear User,\n\nThis is a reminder that you have a room booking scheduled in 1 hour:\n\n` +
            `Room: #${booking.room_id}\n` +
            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
            `Time: ${booking.start_time} - ${booking.end_time}\n\n` +
            `Please make sure to arrive on time.\n\n` +
            `Thank you for using our booking system.`;

          await EmailService.sendEmail(booking.user.email, subject, body);
        }
      }

      // Send reminders for transport bookings
      for (const booking of transportBookings) {
        if (booking.user?.email) {
          const subject = `Reminder: Transport Booking #${booking.transport_id} in 1 hour`;
          const body = `Dear User,\n\nThis is a reminder that you have a transport booking scheduled in 1 hour:\n\n` +
            `Transport: #${booking.transport_id}\n` +
            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
            `Time: ${booking.start_time} - ${booking.end_time}\n` +
            `Destination: ${booking.destination}\n\n` +
            `Please make sure to arrive on time.\n\n` +
            `Thank you for using our booking system.`;

          await EmailService.sendEmail(booking.user.email, subject, body);
        }
      }

      // Send immediate reminders for bookings happening now
      const immediateRoomBookings = await RoomBooking.findAll({
        where: {
          status: 'approved',
          booking_date: now
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['email']
        }]
      });

      const immediateTransportBookings = await TransportBooking.findAll({
        where: {
          status: 'approved',
          booking_date: now
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['email']
        }]
      });

      // Send immediate reminders for room bookings
      for (const booking of immediateRoomBookings) {
        if (booking.user?.email) {
          const subject = `Reminder: Room Booking #${booking.room_id} is starting now`;
          const body = `Dear User,\n\nThis is a reminder that your room booking is starting now:\n\n` +
            `Room: #${booking.room_id}\n` +
            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
            `Time: ${booking.start_time} - ${booking.end_time}\n\n` +
            `Please proceed to your booked room.\n\n` +
            `Thank you for using our booking system.`;

          await EmailService.sendEmail(booking.user.email, subject, body);
        }
      }

      // Send immediate reminders for transport bookings
      for (const booking of immediateTransportBookings) {
        if (booking.user?.email) {
          const subject = `Reminder: Transport Booking #${booking.transport_id} is starting now`;
          const body = `Dear User,\n\nThis is a reminder that your transport booking is starting now:\n\n` +
            `Transport: #${booking.transport_id}\n` +
            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
            `Time: ${booking.start_time} - ${booking.end_time}\n` +
            `Destination: ${booking.destination}\n\n` +
            `Please proceed to your transport.\n\n` +
            `Thank you for using our booking system.`;

          await EmailService.sendEmail(booking.user.email, subject, body);
        }
      }

    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }
}

export default ReminderService; 