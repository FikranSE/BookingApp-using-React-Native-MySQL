"use strict";
// backend/src/controllers/userController.ts
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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const userService_1 = __importDefault(require("../services/userService"));
class UserController {
    static importFromExcel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validasi ketersediaan file
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        error: 'Tidak ada file yang diunggah'
                    });
                }
                // Validasi ekstensi file
                const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
                if (!['.xlsx', '.xls'].includes(fileExtension)) {
                    // Hapus file jika tidak valid
                    fs_1.default.unlinkSync(req.file.path);
                    return res.status(400).json({
                        success: false,
                        error: 'Format file harus .xlsx atau .xls'
                    });
                }
                // Validasi ukuran file (max 5MB)
                const fileSizeInMB = req.file.size / (1024 * 1024);
                if (fileSizeInMB > 5) {
                    fs_1.default.unlinkSync(req.file.path);
                    return res.status(400).json({
                        success: false,
                        error: 'Ukuran file terlalu besar. Maksimal 5MB'
                    });
                }
                // Process file Excel dan import data pengguna
                const importResults = yield userService_1.default.importFromExcel(req.file.path);
                // Hapus file temporary setelah selesai
                fs_1.default.unlinkSync(req.file.path);
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
            }
            catch (error) {
                // Pastikan file temporary dihapus jika terjadi error
                if (req.file && fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                return res.status(500).json({
                    success: false,
                    error: error.message || 'Terjadi kesalahan saat mengimpor data'
                });
            }
        });
    }
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search || '';
                const result = yield userService_1.default.getAll(page, limit, search);
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
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    // Get user by ID
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                const user = yield userService_1.default.getById(userId);
                res.status(200).json({
                    message: 'Berhasil mendapatkan data pengguna',
                    data: user
                });
            }
            catch (error) {
                res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 500).json({
                    error: error.message
                });
            }
        });
    }
    // Create new user (admin only)
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, phone } = req.body;
                const result = yield userService_1.default.create({ name, email, password, phone });
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
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Update user
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                const { name, email, phone } = req.body;
                // Check if user has permission (admin or own account)
                const requestingUserId = req.user.id;
                const result = yield userService_1.default.update(userId, { name, email, phone });
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
            }
            catch (error) {
                res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 400).json({
                    error: error.message
                });
            }
        });
    }
    // Delete user
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                yield userService_1.default.delete(userId);
                res.status(200).json({
                    message: 'Pengguna berhasil dihapus'
                });
            }
            catch (error) {
                res.status(error.message === 'Pengguna tidak ditemukan' ? 404 : 500).json({
                    error: error.message
                });
            }
        });
    }
    // Get current user profile
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const user = yield userService_1.default.getById(userId);
                res.status(200).json({
                    message: 'Berhasil mendapatkan profil',
                    data: user
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    // Update current user profile
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { name, phone } = req.body;
                const result = yield userService_1.default.updateProfile(userId, { name, phone });
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
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.default = UserController;
