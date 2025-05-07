// src/middlewares/adminAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Request interface to include admin_id
declare global {
  namespace Express {
    interface Request {
      admin_id?: number;
    }
  }
}

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, role: string };
    
    // Check if user role is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }

    // Add admin_id to request object
    req.admin_id = decoded.id;
    
    // Log for debugging
    console.log(`Authenticated admin with ID: ${decoded.id}`);
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Token tidak valid.' });
  }
};

// This middleware is specifically for the profile editing endpoint
export const profileAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, role: string };
    
    // Check if user role is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }

    // Add admin_id to request object
    req.admin_id = decoded.id;
    
    // Log for debugging
    console.log(`Admin profile access with ID: ${decoded.id}`);
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Token tidak valid.' });
  }
};