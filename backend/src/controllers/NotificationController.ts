// src/controllers/NotificationController.ts
import { Request, Response } from 'express';
import Notification from '../models/Notification';
import RoomBooking from '../models/RoomBookings';
import TransportBooking from '../models/TransportBookings';
import Room from '../models/Room';
import Transport from '../models/Transport';

class NotificationController {
  /**
   * Get unread notification count
   */
  public static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const count = await Notification.count({
        where: { user_id: userId, is_read: false }
      });
      
      return res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all notifications for the current user
   */
  public static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Get notifications from newest to oldest
      const notifications = await Notification.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 50 // Limit to most recent 50 notifications
      });

      // Format the response
      const formattedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          let additionalData = {};
          
          // For room bookings, get room details
          if (notification.type === 'ROOM') {
            const booking = await RoomBooking.findByPk(notification.reference_id, {
              include: [{ model: Room, as: 'room' }]
            });
            
            if (booking && booking.room) {
              additionalData = {
                roomName: booking.room.room_name,
                roomType: booking.room.room_type,
                bookingDate: booking.booking_date,
                startTime: booking.start_time,
                endTime: booking.end_time
              };
            }
          } 
          // For transport bookings, get transport details
          else if (notification.type === 'TRANSPORT') {
            const booking = await TransportBooking.findByPk(notification.reference_id, {
              include: [{ model: Transport, as: 'transport' }]
            });
            
            if (booking && booking.transport) {
              additionalData = {
                vehicleName: booking.transport.vehicle_name,
                vehicleType: booking.transport.vehicle_type,
                bookingDate: booking.booking_date,
                startTime: booking.start_time,
                endTime: booking.end_time,
                destination: booking.destination
              };
            }
          }
          
          return {
            id: notification.notification_id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            status: notification.status,
            read: notification.is_read,
            createdAt: notification.createdAt,
            reference_id: notification.reference_id,
            ...additionalData
          };
        })
      );
      
      return res.status(200).json(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Mark a notification as read
   */
  public static async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);
      
      const notification = await Notification.findOne({
        where: { notification_id: notificationId, user_id: userId }
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      notification.is_read = true;
      await notification.save();
      
      return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Mark all notifications as read
   */
  public static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
      );
      
      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default NotificationController;