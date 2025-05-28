"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = require("../utils/token");
class AuthService {
    static editProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone, password } = data;
            // Cari pengguna berdasarkan userId
            const user = yield User_1.default.findByPk(userId);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            // Update nama jika ada perubahan
            if (name) {
                user.name = name;
            }
            // Update email jika ada perubahan
            if (email) {
                // Cek apakah email sudah terdaftar oleh pengguna lain
                const existingUser = yield User_1.default.findOne({ where: { email } });
                if (existingUser && existingUser.id !== user.id) {
                    throw new Error('Email sudah terdaftar');
                }
                user.email = email;
            }
            // Update nomor telepon jika ada perubahan
            if (phone) {
                user.phone = phone;
            }
            // Update password jika ada perubahan
            if (password) {
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                user.password = hashedPassword;
            }
            // Simpan perubahan
            yield user.save();
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
            };
        });
    }
    // Registrasi pengguna baru
    static register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, phone } = data;
            // Cek apakah email sudah terdaftar
            const existingUser = yield User_1.default.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email sudah terdaftar');
            }
            // Hash password
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Buat pengguna baru
            const user = yield User_1.default.create({
                name,
                email,
                password: hashedPassword,
                phone,
            });
            // Hasilkan token
            const token = (0, token_1.generateToken)({ id: user.id, email: user.email });
            return { user, token };
        });
    }
    // Login pengguna
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = data;
            // Cari pengguna berdasarkan email
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email atau password salah');
            }
            // Cek password
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Email atau password salah');
            }
            // Hasilkan token
            const token = (0, token_1.generateToken)({ id: user.id, email: user.email });
            return { user, token };
        });
    }
    // Ganti password pengguna
    static changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(userId);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            // Cek apakah password saat ini cocok
            const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error('Password saat ini salah');
            }
            // Hash password baru
            const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
            // Update password pengguna
            user.password = hashedNewPassword;
            yield user.save();
            return { message: 'Password berhasil diubah' };
        });
    }
}
exports.default = AuthService;
