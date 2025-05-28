"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transportRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middlewares/adminMiddleware"));
const transportController_1 = __importDefault(require("../controllers/transportController"));
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.default, adminMiddleware_1.default, transportController_1.default.createTransport);
router.get('/', authMiddleware_1.default, transportController_1.default.getAllTransports);
router.get('/:id', authMiddleware_1.default, transportController_1.default.getTransportById);
router.put('/:id', authMiddleware_1.default, adminMiddleware_1.default, transportController_1.default.updateTransport);
router.delete('/:id', authMiddleware_1.default, adminMiddleware_1.default, transportController_1.default.deleteTransport);
exports.default = router;
