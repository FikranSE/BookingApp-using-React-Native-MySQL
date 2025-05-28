"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transportBookingRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const transportBookingController_1 = __importDefault(require("../controllers/transportBookingController"));
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.default, transportBookingController_1.default.createBooking);
router.get('/', authMiddleware_1.default, transportBookingController_1.default.getAllBookings);
router.get('/:id', authMiddleware_1.default, transportBookingController_1.default.getBookingById);
router.put('/:id', authMiddleware_1.default, transportBookingController_1.default.updateBooking);
router.delete('/:id', authMiddleware_1.default, adminMiddleware_1.default, transportBookingController_1.default.deleteBooking);
exports.default = router;
