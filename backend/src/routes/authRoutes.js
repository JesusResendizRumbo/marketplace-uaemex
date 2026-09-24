import { Router } from 'express';
import { register, verifyOTP, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateProfile } from '../controllers/userController.js';
import { validateUAEMexEmail } from '../middlewares/validateDomain.js';
import { requireAuth } from '../middlewares/auth.js';
import { sendVerificationOTP } from '../config/mailer.js';

const router = Router();

// Endpoint de prueba en vivo desde Render
router.get('/test-email', async (req, res) => {
  const target = req.query.to || 'jresendizr002@alumno.uaemex.mx';
  try {
    const info = await sendVerificationOTP(target, '999888', 'Prueba Directa Render');
    res.json({
      success: true,
      message: 'Correo enviado correctamente desde Render',
      target,
      response: info ? info.response : null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }
});

// Rutas públicas
router.post('/register', validateUAEMexEmail, register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rutas protegidas
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
