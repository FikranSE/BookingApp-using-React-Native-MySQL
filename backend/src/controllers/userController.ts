// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import UserService from '../services/userService';

class UserController {
  // Get all users
  public static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      
      const result = await UserService.getAll(page, limit, search);
      res.status(200).json({
        message: 'Berhasil mendapatkan daftar pengguna',
        data: result.users,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user by ID
  public static async getById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserService.getById(userId);
      res.status(200).json({
        message: 'Berhasil mendapatkan data pengguna',
        data: user
      });
    } catch (error: any) {
      res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 500).json({ 
        error: error.message 
      });
    }
  }

  // Create new user (admin only)
  public static async create(req: Request, res: Response) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await UserService.create({ name, email, password, phone });
      res.status(201).json({
        message: 'Pengguna berhasil dibuat',
        data: {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          createdAt: result.createdAt
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user
  public static async update(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, phone } = req.body;
      
      // Check if user has permission (admin or own account)
      const requestingUserId = (req as any).user.id;
      
      
      const result = await UserService.update(userId, { name, email, phone });
      res.status(200).json({
        message: 'Pengguna berhasil diperbarui',
        data: {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          updatedAt: result.updatedAt
        }
      });
    } catch (error: any) {
      res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 400).json({ 
        error: error.message 
      });
    }
  }

  // Delete user
  public static async delete(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);     
      
      await UserService.delete(userId);
      res.status(200).json({
        message: 'Pengguna berhasil dihapus'
      });
    } catch (error: any) {
      res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 500).json({ 
        error: error.message 
      });
    }
  }

  // Get current user profile
  public static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.getById(userId);
      res.status(200).json({
        message: 'Berhasil mendapatkan profil',
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update current user profile
  public static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, phone } = req.body;
      
      const result = await UserService.updateProfile(userId, { name, phone });
      res.status(200).json({
        message: 'Profil berhasil diperbarui',
        data: {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          updatedAt: result.updatedAt
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default UserController;