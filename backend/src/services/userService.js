"use strict";
// backend/src/services/userService.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const sequelize_1 = require("sequelize");
const XLSX = __importStar(require("xlsx"));
const logger_1 = require("../utils/logger");
class UserService {
    // Add this method to your UserService class
    // Import users from Excel file
    static importFromExcel(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Baca file Excel
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Konversi sheet ke JSON
            const data = XLSX.utils.sheet_to_json(worksheet);
            // Inisialisasi hasil import
            const results = {
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
            const firstRow = data[0];
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
                const row = data[i];
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
                    const existingUser = yield User_1.default.findOne({ where: { email: row.email } });
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
                    yield UserService.create({
                        name: row.name.trim(),
                        email: row.email.trim(),
                        password: row.password.trim(),
                        phone: row.phone ? row.phone.trim() : undefined
                    });
                    results.successCount++;
                }
                catch (error) {
                    results.failedCount++;
                    results.errors.push({
                        row: i + 2,
                        email: row.email || 'N/A',
                        error: error.message || 'Error tidak diketahui'
                    });
                    // Log error untuk debugging
                    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.error(`Error saat import user row ${i + 2}: ${error.message}`);
                }
            }
            return results;
        });
    }
    // Get all users with pagination and search
    static getAll(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = (page - 1) * limit;
            const whereClause = search
                ? {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: `%${search}%` } },
                        { email: { [sequelize_1.Op.like]: `%${search}%` } },
                        { phone: { [sequelize_1.Op.like]: `%${search}%` } }
                    ]
                }
                : {};
            const { count, rows } = yield User_1.default.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt'],
                limit,
                offset,
                order: [['id', 'DESC']]
            });
            return {
                users: rows,
                total: count
            };
        });
    }
    // Get user by ID
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id, {
                attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt']
            });
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            return user;
        });
    }
    // Create new user
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, phone = 'user' } = data;
            // Check if email already exists
            const existingUser = yield User_1.default.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email sudah terdaftar');
            }
            // Hash password
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Create user
            const user = yield User_1.default.create({
                name,
                email,
                password: hashedPassword,
                phone
            });
            return user;
        });
    }
    // Update user
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone } = data;
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            // Check if email is being changed and if it already exists
            if (email && email !== user.email) {
                const existingUser = yield User_1.default.findOne({ where: { email } });
                if (existingUser) {
                    throw new Error('Email sudah digunakan');
                }
                user.email = email;
            }
            // Update other fields if provided
            if (name)
                user.name = name;
            if (phone)
                user.phone = phone;
            yield user.save();
            return user;
        });
    }
    // Delete user
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            yield user.destroy();
            return true;
        });
    }
    // Update user profile (limited fields)
    static updateProfile(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, phone } = data;
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            // Update fields if provided
            if (name)
                user.name = name;
            if (phone)
                user.phone = phone;
            yield user.save();
            return user;
        });
    }
}
exports.default = UserService;
