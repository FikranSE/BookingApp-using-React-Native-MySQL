"use strict";
// backend/src/middlewares/errorHandler.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../utils/logger"); // Asumsi ada logger, jika tidak abaikan bagian ini
/**
 * Middleware penanganan error global
 */
const errorHandler = (err, req, res, next) => {
    // Log error untuk debugging
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.error(`Error: ${err.message || 'Unknown error'}`);
    // Handle multer error
    if (err instanceof multer_1.default.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'Ukuran file terlalu besar. Maksimal 5MB'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'Tipe file tidak didukung'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: `Error upload file: ${err.message}`
                });
        }
    }
    // Handle error lainnya
    return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Terjadi kesalahan pada server'
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
