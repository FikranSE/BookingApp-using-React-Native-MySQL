// backend/src/services/userService.ts

import User from '../models/User';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import { logger } from '../utils/logger';
import fs from 'fs';

interface ImportResultType {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; email: string; error: string }>;
}
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

class UserService {



// Add this method to your UserService class

  // Import users from Excel file
  public static async importFromExcel(filePath: string): Promise<ImportResultType> {
    // Baca file Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Konversi sheet ke JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Inisialisasi hasil import
    const results: ImportResultType = {
      totalProcessed: data.length,
      successCount: 0,
      failedCount: 0,
      errors: []
    };
    
    // Jika tidak ada data
    if (data.length === 0) {
      results.errors.push({
        row: 0,
        email: 'N/A',
        error: 'File tidak berisi data'
      });
      return results;
    }
    
    // Validasi header kolom
    const firstRow = data[0] as any;
    const requiredColumns = ['name', 'email', 'password'];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      results.errors.push({
        row: 1,
        email: 'N/A',
        error: `Kolom ${missingColumns.join(', ')} tidak ditemukan`
      });
      return results;
    }
    
    // Process setiap baris data
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      try {
        // Validasi kolom yang diperlukan
        if (!row.name || !row.email || !row.password) {
          results.failedCount++;
          results.errors.push({
            row: i + 2, // +2 untuk header row dan 0-indexing
            email: row.email || 'N/A',
            error: 'Kolom name, email, atau password tidak boleh kosong'
          });
          continue;
        }
        
        // Validasi format email
        if (!/\S+@\S+\.\S+/.test(row.email)) {
          results.failedCount++;
          results.errors.push({
            row: i + 2,
            email: row.email,
            error: 'Format email tidak valid'
          });
          continue;
        }
        
        // Validasi panjang password
        if (row.password.length < 6) {
          results.failedCount++;
          results.errors.push({
            row: i + 2,
            email: row.email,
            error: 'Password harus minimal 6 karakter'
          });
          continue;
        }
        
        // Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email: row.email } });
        if (existingUser) {
          results.failedCount++;
          results.errors.push({
            row: i + 2,
            email: row.email,
            error: 'Email sudah terdaftar'
          });
          continue;
        }
        
        // Buat user baru
        await UserService.create({
          name: row.name.trim(),
          email: row.email.trim(),
          password: row.password.trim(),
          phone: row.phone ? row.phone.trim() : undefined
        });
        
        results.successCount++;
      } catch (error: any) {
        results.failedCount++;
        results.errors.push({
          row: i + 2,
          email: row.email || 'N/A',
          error: error.message || 'Error tidak diketahui'
        });
        
        // Log error untuk debugging
        logger?.error(`Error saat import user row ${i+2}: ${error.message}`);
      }
    }
    
    return results;
  }
  // Get all users with pagination and search
  public static async getAll(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    
    const whereClause = search 
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ]
        } 
      : {};
      
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'phone',  'createdAt', 'updatedAt'],
      limit,
      offset,
      order: [['id', 'DESC']]
    });
    
    return {
      users: rows,
      total: count
    };
  }

  // Get user by ID
  public static async getById(id: number) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }
    
    return user;
  }

  // Create new user
  public static async create(data: CreateUserData) {
    const { name, email, password, phone = 'user' } = data;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });
    
    return user;
  }

  // Update user
  public static async update(id: number, data: UpdateUserData) {
    const { name, email, phone } = data;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email sudah digunakan');
      }
      user.email = email;
    }
    
    // Update other fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    return user;
  }

  // Delete user
  public static async delete(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }
    
    await user.destroy();
    return true;
  }

  // Update user profile (limited fields)
  public static async updateProfile(id: number, data: UpdateProfileData) {
    const { name, phone } = data;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    return user;
  }
}

export default UserService;