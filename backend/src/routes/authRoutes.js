"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// Rute publik
router.post('/register', authController_1.default.register);
router.post('/login', authController_1.default.login);
// Rute yang dilindungi (contoh)
router.get('/profile', authMiddleware_1.default, (req, res) => {
    // Akses user yang telah terotentikasi
    res.status(200).json({ message: 'Akses profil berhasil', user: req.user });
});
// Rute untuk mengganti password
router.post('/change-password', authMiddleware_1.default, authController_1.default.changePassword);
router.put('/edit-profile', authMiddleware_1.default, authController_1.default.editProfile);
exports.default = router;
