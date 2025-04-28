// backend/src/services/userService.ts

import User from '../models/User';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

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