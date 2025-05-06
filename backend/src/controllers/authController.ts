import { Request, Response } from 'express';
import AuthService from '../services/authService';

class AuthController {

  public static async editProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // Assuming the user ID is added to the request by an authentication middleware
      const { name, email, phone, password } = req.body;

      // Call the AuthService to update the user's profile
      const result = await AuthService.editProfile(userId, { name, email, phone, password });

      res.status(200).json({
        message: 'Profil berhasil diperbarui',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  // Handler untuk registrasi
  public static async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await AuthService.register({ name, email, password, phone });
      res.status(201).json({
        message: 'Registrasi berhasil',
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            createdAt: result.user.createdAt,
          },
          token: result.token,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Handler untuk login
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.status(200).json({
        message: 'Login berhasil',
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            createdAt: result.user.createdAt,
          },
          token: result.token,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Handler untuk mengganti password
  public static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user.id; // Assuming the user ID is added to the request by an authentication middleware
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default AuthController;
