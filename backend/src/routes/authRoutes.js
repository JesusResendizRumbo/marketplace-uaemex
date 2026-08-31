import { Router } from 'express';
import { register, verifyOTP, login, getMe } from '../controllers/authController.js';
import { updateProfile } from '../controllers/userController.js';
import { validateUAEMexEmail } from '../middlewares/validateDomain.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.post('/register', validateUAEMexEmail, register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// Rutas protegidas
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
