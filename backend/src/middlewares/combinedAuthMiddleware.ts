// src/middlewares/combinedAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { adminAuthMiddleware } from './adminAuthMiddleware';
import authMiddleware from './authMiddleware';
const combinedAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, (authErr: any) => {
    if (!authErr) {
      return next();  
    }

    adminAuthMiddleware(req, res, (adminErr: any) => {
      if (!adminErr) {
        return next(); 
      }

      return res.status(401).json({ message: 'Unauthorized' });
    });
  });
};

export default combinedAuthMiddleware;
