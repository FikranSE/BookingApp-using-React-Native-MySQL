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
const sequelize_1 = require("sequelize");
class ReminderService {
    // Schedule reminders for all upcoming bookings
    static scheduleReminders() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const now = new Date();
                const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
                // Get room bookings that need reminders
                const roomBookings = yield models_1.RoomBooking.findAll({
                    where: {
                        status: 'approved',
                        booking_date: {
                            [sequelize_1.Op.gte]: now,
                            [sequelize_1.Op.lte]: oneHourFromNow
                        }
                    },
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['email']
                        }]
                });
                // Get transport bookings that need reminders
                const transportBookings = yield models_1.TransportBooking.findAll({
                    where: {
                        status: 'approved',
                        booking_date: {
                            [sequelize_1.Op.gte]: now,
                            [sequelize_1.Op.lte]: oneHourFromNow
                        }
                    },
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['email']
                        }]
                });
                // Send reminders for room bookings
                for (const booking of roomBookings) {
                    if ((_a = booking.user) === null || _a === void 0 ? void 0 : _a.email) {
                        const subject = `Reminder: Room Booking #${booking.room_id} in 1 hour`;
                        const body = `Dear User,\n\nThis is a reminder that you have a room booking scheduled in 1 hour:\n\n` +
                            `Room: #${booking.room_id}\n` +
                            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
                            `Time: ${booking.start_time} - ${booking.end_time}\n\n` +
                            `Please make sure to arrive on time.\n\n` +
                            `Thank you for using our booking system.`;
                        yield EmailService_1.default.sendEmail(booking.user.email, subject, body);
                    }
                }
                // Send reminders for transport bookings
                for (const booking of transportBookings) {
                    if ((_b = booking.user) === null || _b === void 0 ? void 0 : _b.email) {
                        const subject = `Reminder: Transport Booking #${booking.transport_id} in 1 hour`;
                        const body = `Dear User,\n\nThis is a reminder that you have a transport booking scheduled in 1 hour:\n\n` +
                            `Transport: #${booking.transport_id}\n` +
                            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
                            `Time: ${booking.start_time} - ${booking.end_time}\n` +
                            `Destination: ${booking.destination}\n\n` +
                            `Please make sure to arrive on time.\n\n` +
                            `Thank you for using our booking system.`;
                        yield EmailService_1.default.sendEmail(booking.user.email, subject, body);
                    }
                }
                // Send immediate reminders for bookings happening now
                const immediateRoomBookings = yield models_1.RoomBooking.findAll({
                    where: {
                        status: 'approved',
                        booking_date: now
                    },
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['email']
                        }]
                });
                const immediateTransportBookings = yield models_1.TransportBooking.findAll({
                    where: {
                        status: 'approved',
                        booking_date: now
                    },
                    include: [{
                            model: models_1.User,
                            as: 'user',
                            attributes: ['email']
                        }]
                });
                // Send immediate reminders for room bookings
                for (const booking of immediateRoomBookings) {
                    if ((_c = booking.user) === null || _c === void 0 ? void 0 : _c.email) {
                        const subject = `Reminder: Room Booking #${booking.room_id} is starting now`;
                        const body = `Dear User,\n\nThis is a reminder that your room booking is starting now:\n\n` +
                            `Room: #${booking.room_id}\n` +
                            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
                            `Time: ${booking.start_time} - ${booking.end_time}\n\n` +
                            `Please proceed to your booked room.\n\n` +
                            `Thank you for using our booking system.`;
                        yield EmailService_1.default.sendEmail(booking.user.email, subject, body);
                    }
                }
                // Send immediate reminders for transport bookings
                for (const booking of immediateTransportBookings) {
                    if ((_d = booking.user) === null || _d === void 0 ? void 0 : _d.email) {
                        const subject = `Reminder: Transport Booking #${booking.transport_id} is starting now`;
                        const body = `Dear User,\n\nThis is a reminder that your transport booking is starting now:\n\n` +
                            `Transport: #${booking.transport_id}\n` +
                            `Date: ${new Date(booking.booking_date).toLocaleDateString()}\n` +
                            `Time: ${booking.start_time} - ${booking.end_time}\n` +
                            `Destination: ${booking.destination}\n\n` +
                            `Please proceed to your transport.\n\n` +
                            `Thank you for using our booking system.`;
                        yield EmailService_1.default.sendEmail(booking.user.email, subject, body);
                    }
                }
            }
            catch (error) {
                console.error('Error scheduling reminders:', error);
            }
        });
    }
}
exports.default = ReminderService;
