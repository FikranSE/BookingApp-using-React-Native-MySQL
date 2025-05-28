"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminAuthMiddleware_1 = require("./adminAuthMiddleware");
const authMiddleware_1 = __importDefault(require("./authMiddleware"));
const combinedAuthMiddleware = (req, res, next) => {
    (0, authMiddleware_1.default)(req, res, (authErr) => {
        if (!authErr) {
            return next();
        }
        (0, adminAuthMiddleware_1.adminAuthMiddleware)(req, res, (adminErr) => {
            if (!adminErr) {
                return next();
            }
            return res.status(401).json({ message: 'Unauthorized' });
        });
    });
};
exports.default = combinedAuthMiddleware;
