"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/roomRoutes.ts
const express_1 = require("express");
const RoomController_1 = __importDefault(require("../controllers/RoomController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.default, adminMiddleware_1.default, RoomController_1.default.createRoom);
router.get('/', authMiddleware_1.default, RoomController_1.default.getAllRooms);
router.get('/:id', authMiddleware_1.default, RoomController_1.default.getRoomById);
router.put('/:id', authMiddleware_1.default, adminMiddleware_1.default, RoomController_1.default.updateRoom);
router.delete('/:id', authMiddleware_1.default, adminMiddleware_1.default, RoomController_1.default.deleteRoom);
exports.default = router;
