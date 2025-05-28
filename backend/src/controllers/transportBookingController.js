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
const TransportBookingService_1 = __importDefault(require("../services/TransportBookingService"));
class TransportBookingController {
    static createBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield TransportBookingService_1.default.createBooking(Object.assign(Object.assign({}, req.body), { user_id: req.user.id }));
                res.status(201).json(booking);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static getAllBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield TransportBookingService_1.default.getAllBookings();
                res.status(200).json(bookings);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static getBookingById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield TransportBookingService_1.default.getBookingById(Number(req.params.id));
                if (booking) {
                    res.status(200).json(booking);
                }
                else {
                    res.status(404).json({ error: 'Booking not found' });
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static updateBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = Number(req.params.id);
                const updateData = req.body;
                console.log(`Updating transport booking ${bookingId} to status: ${updateData.status}`);
                const updatedBooking = yield TransportBookingService_1.default.updateBooking(bookingId, updateData);
                if (updatedBooking) {
                    let userEmail = yield TransportBookingService_1.default.getUserEmailByBookingId(bookingId);
                    if (userEmail) {
                        const subject = `Transport Booking Status: ${updateData.status.toUpperCase()}`;
                        const body = `Dear User,\n\nYour booking for Transport #${updatedBooking.transport_id} on ${new Date(updatedBooking.booking_date).toLocaleDateString()} has been ${updateData.status.toLowerCase()}.\n\n${updateData.notes ? `Notes:\n${updateData.notes}\n\n` : ''}Thank you for using our booking system.`;
                        console.log("Email parameters:", { to: userEmail, subject, bodyPreview: body.substring(0, 50) + "..." });
                        const emailResult = yield TransportBookingService_1.default.sendEmail(userEmail, subject, body);
                        console.log(`Email sending result: ${emailResult ? "SUCCESS" : "FAILED"}`);
                        return res.status(200).json(Object.assign(Object.assign({}, updatedBooking.toJSON()), { emailSent: emailResult, emailRecipient: userEmail }));
                    }
                    else {
                        console.warn(`No email address found for transport booking ${bookingId}`);
                        return res.status(200).json(Object.assign(Object.assign({}, updatedBooking.toJSON()), { emailSent: false, emailError: "No email address found" }));
                    }
                }
                else {
                    return res.status(404).json({ error: "Booking not found" });
                }
            }
            catch (error) {
                console.error("Error updating booking:", error);
                return res.status(500).json({
                    error: error.message || "Internal server error",
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
    }
    static deleteBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield TransportBookingService_1.default.deleteBooking(Number(req.params.id));
                if (deleted) {
                    res.status(200).json({ message: 'Booking deleted successfully' });
                }
                else {
                    res.status(404).json({ error: 'Booking not found' });
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.default = TransportBookingController;
