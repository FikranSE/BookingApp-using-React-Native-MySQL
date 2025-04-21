import User from '../models/User';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Registrasi pengguna baru
  public static async register(data: RegisterData) {
    const { name, email, password, phone } = data;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Hasilkan token
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  // Login pengguna
  public static async login(data: LoginData) {
    const { email, password } = data;

    // Cari pengguna berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email atau password salah');
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Email atau password salah');
    }

    // Hasilkan token
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  // Ganti password pengguna
  public static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }

    // Cek apakah password saat ini cocok
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Password saat ini salah');
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password pengguna
    user.password = hashedNewPassword;
    await user.save();

    return { message: 'Password berhasil diubah' };
  }
}

export default AuthService;
