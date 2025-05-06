import { Router } from 'express';
import AuthController from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Rute publik
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rute yang dilindungi (contoh)
router.get('/profile', authMiddleware, (req, res) => {
  // Akses user yang telah terotentikasi
  res.status(200).json({ message: 'Akses profil berhasil', user: (req as any).user });
});

// Rute untuk mengganti password
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.put('/edit-profile', authMiddleware, AuthController.editProfile);


export default router;
