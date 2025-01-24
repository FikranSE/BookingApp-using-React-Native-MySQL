// src/middlewares/adminMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin';
import { verifyToken } from '../utils/token';

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded: any = verifyToken(token);
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default adminMiddleware;
