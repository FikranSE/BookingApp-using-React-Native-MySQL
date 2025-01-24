// src/middleware/adminAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  admin?: any;
}

export const adminAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };

      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Admin hanya yang diperbolehkan.' });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Token tidak valid.' });
    }
  } else {
    return res.status(401).json({ message: 'Tidak ada token, otorisasi dibutuhkan.' });
  }
};
