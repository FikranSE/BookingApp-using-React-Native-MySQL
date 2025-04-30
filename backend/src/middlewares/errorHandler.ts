// backend/src/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger'; // Asumsi ada logger, jika tidak abaikan bagian ini

/**
 * Middleware penanganan error global
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error untuk debugging
  logger?.error(`Error: ${err.message || 'Unknown error'}`);
  
  // Handle multer error
  if (err instanceof multer.MulterError) {
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

export default errorHandler;