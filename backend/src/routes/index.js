"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const transportRoutes_1 = __importDefault(require("./transportRoutes"));
const roomRoutes_1 = __importDefault(require("./roomRoutes"));
const transportBookingRoutes_1 = __importDefault(require("./transportBookingRoutes"));
const roomBookingRoutes_1 = __importDefault(require("./roomBookingRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/admins', adminRoutes_1.default);
router.use('/transports', transportRoutes_1.default);
router.use('/rooms', roomRoutes_1.default);
router.use('/transport-bookings', transportBookingRoutes_1.default);
router.use('/room-bookings', roomBookingRoutes_1.default);
exports.default = router;
