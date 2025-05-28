"use strict";
// backend/src/utils/logger.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Konfigurasi format log
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`));
// Konfigurasi logger
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Log ke file untuk semua log
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/combined.log')
        }),
        // Log ke console di development
        ...(process.env.NODE_ENV !== 'production'
            ? [new winston_1.default.transports.Console({ format: winston_1.default.format.simple() })]
            : [])
    ],
});
// Pastikan folder logs ada
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
exports.default = exports.logger;
