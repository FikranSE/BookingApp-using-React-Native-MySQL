// src/controllers/adminAuthController.ts
import { Request, Response } from 'express';
import Admin from '../models/Admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { generateToken } from '../utils/generateToken';
dotenv.config();

/**
 * Register Admin
 */
export const adminRegister = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Cek apakah Admin sudah ada
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin dengan email tersebut sudah terdaftar.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat Admin baru
    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    // Buat token
    const token = jwt.sign(
      { id: admin.admin_id, role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'Admin berhasil dibuat.',
      token,
      admin: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Error during admin registration:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Admin Login
 */
export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      // Cari Admin berdasarkan email
      const admin = await Admin.findOne({ where: { email } });
      if (!admin) {
        return res.status(400).json({ message: 'Email atau password salah.' });
      }
  
      // Cek password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email atau password salah.' });
      }
  
      // Buat token dengan peran 'admin'
      const token = generateToken({ id: admin.admin_id, role: 'admin' });
  
      return res.status(200).json({
        message: 'Login berhasil.',
        token,
        admin: {
          id: admin.admin_id,
          username: admin.username,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };
