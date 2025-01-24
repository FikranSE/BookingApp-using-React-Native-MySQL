// src/controllers/adminController.ts
import { Request, Response } from 'express';
import Admin from '../models/Admin';
import bcrypt from 'bcrypt';

/**
 * Get All Admins
 */
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['admin_id', 'username', 'email', 'createdAt', 'updatedAt'],
    });

    return res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Get Admin by ID
 */
export const getAdminById = async (req: Request, res: Response) => {
  const { admin_id } = req.params;

  try {
    const admin = await Admin.findByPk(admin_id, {
      attributes: ['admin_id', 'username', 'email', 'createdAt', 'updatedAt'],
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    return res.status(200).json({ admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Update Admin
 */
export const updateAdmin = async (req: Request, res: Response) => {
  const { admin_id } = req.params;
  const { username, email, password } = req.body;

  try {
    const admin = await Admin.findByPk(admin_id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    return res.status(200).json({
      message: 'Admin berhasil diperbarui.',
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Delete Admin
 */
export const deleteAdmin = async (req: Request, res: Response) => {
  const { admin_id } = req.params;

  try {
    const admin = await Admin.findByPk(admin_id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    await admin.destroy();

    return res.status(200).json({ message: 'Admin berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
