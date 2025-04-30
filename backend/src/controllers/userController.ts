// backend/src/controllers/userController.ts

import { Request, Response } from 'express';

import path from 'path';
import fs from 'fs';
import UserService from '../services/userService';

class UserController {
  
public static async importFromExcel(req: Request, res: Response) {
  try {
    // Validasi ketersediaan file
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'Tidak ada file yang diunggah' 
      });
    }

    // Validasi ekstensi file
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExtension)) {
      // Hapus file jika tidak valid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false,
        error: 'Format file harus .xlsx atau .xls' 
      });
    }
    
    // Validasi ukuran file (max 5MB)
    const fileSizeInMB = req.file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Ukuran file terlalu besar. Maksimal 5MB'
      });
    }
    
    // Process file Excel dan import data pengguna
    const importResults = await UserService.importFromExcel(req.file.path);
    
    // Hapus file temporary setelah selesai
    fs.unlinkSync(req.file.path);
    
    // Response hasil import
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengimpor pengguna dari Excel',
      data: {
        totalProcessed: importResults.totalProcessed,
        successCount: importResults.successCount,
        failedCount: importResults.failedCount,
        errors: importResults.errors
      }
    });
  } catch (error: any) {
    // Pastikan file temporary dihapus jika terjadi error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengimpor data'
    });
  }
}

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