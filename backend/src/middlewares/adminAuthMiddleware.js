"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileAuthMiddleware = exports.adminAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const adminAuthMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if user role is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
        }
        // Add admin_id to request object
        req.admin_id = decoded.id;
        // Log for debugging
        console.log(`Authenticated admin with ID: ${decoded.id}`);
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Token tidak valid.' });
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
// This middleware is specifically for the profile editing endpoint
const profileAuthMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if user role is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
        }
        // Add admin_id to request object
        req.admin_id = decoded.id;
        // Log for debugging
        console.log(`Admin profile access with ID: ${decoded.id}`);
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Token tidak valid.' });
    }
};
exports.profileAuthMiddleware = profileAuthMiddleware;
