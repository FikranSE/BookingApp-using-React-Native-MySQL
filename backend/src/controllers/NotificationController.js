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
const Notification_1 = __importDefault(require("../models/Notification"));
const RoomBookings_1 = __importDefault(require("../models/RoomBookings"));
const TransportBookings_1 = __importDefault(require("../models/TransportBookings"));
const Room_1 = __importDefault(require("../models/Room"));
const Transport_1 = __importDefault(require("../models/Transport"));
class NotificationController {
    /**
     * Get unread notification count
     */
    static getUnreadCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const count = yield Notification_1.default.count({
                    where: { user_id: userId, is_read: false }
                });
                return res.status(200).json({ count });
            }
            catch (error) {
                console.error('Error getting unread count:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Get all notifications for the current user
     */
    static getUserNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                // Get notifications from newest to oldest
                const notifications = yield Notification_1.default.findAll({
                    where: { user_id: userId },
                    order: [['createdAt', 'DESC']],
                    limit: 50 // Limit to most recent 50 notifications
                });
                // Format the response
                const formattedNotifications = yield Promise.all(notifications.map((notification) => __awaiter(this, void 0, void 0, function* () {
                    let additionalData = {};
                    // For room bookings, get room details
                    if (notification.type === 'ROOM') {
                        const booking = yield RoomBookings_1.default.findByPk(notification.reference_id, {
                            include: [{ model: Room_1.default, as: 'room' }]
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
                        const booking = yield TransportBookings_1.default.findByPk(notification.reference_id, {
                            include: [{ model: Transport_1.default, as: 'transport' }]
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
                    return Object.assign({ id: notification.notification_id, title: notification.title, message: notification.message, type: notification.type, status: notification.status, read: notification.is_read, createdAt: notification.createdAt, reference_id: notification.reference_id }, additionalData);
                })));
                return res.status(200).json(formattedNotifications);
            }
            catch (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Mark a notification as read
     */
    static markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const notificationId = parseInt(req.params.id);
                const notification = yield Notification_1.default.findOne({
                    where: { notification_id: notificationId, user_id: userId }
                });
                if (!notification) {
                    return res.status(404).json({ message: 'Notification not found' });
                }
                notification.is_read = true;
                yield notification.save();
                return res.status(200).json({ message: 'Notification marked as read' });
            }
            catch (error) {
                console.error('Error marking notification as read:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Mark all notifications as read
     */
    static markAllAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                yield Notification_1.default.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
                return res.status(200).json({ message: 'All notifications marked as read' });
            }
            catch (error) {
                console.error('Error marking all notifications as read:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.default = NotificationController;
