"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/roomBookingRoutes.ts
const express_1 = require("express");
const combinedAuthMiddleware_1 = __importDefault(require("../middlewares/combinedAuthMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const roomBookingController_1 = __importDefault(require("../controllers/roomBookingController"));
const router = (0, express_1.Router)();
router.post('/', combinedAuthMiddleware_1.default, roomBookingController_1.default.createBooking);
router.get('/', combinedAuthMiddleware_1.default, roomBookingController_1.default.getAllBookings);
router.get('/:id', combinedAuthMiddleware_1.default, roomBookingController_1.default.getBookingById);
router.put('/:id', combinedAuthMiddleware_1.default, roomBookingController_1.default.updateBooking);
router.delete('/:id', adminMiddleware_1.default, roomBookingController_1.default.deleteBooking);
exports.default = router;
