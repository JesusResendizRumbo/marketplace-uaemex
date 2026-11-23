import { Router } from 'express';
import { register, verifyOTP, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateProfile } from '../controllers/userController.js';
import { validateUAEMexEmail } from '../middlewares/validateDomain.js';
import { requireAuth } from '../middlewares/auth.js';
import { sendVerificationOTP, sendMessageNotificationEmail } from '../config/mailer.js';

const router = Router();

// Endpoint de diagnóstico en vivo para Render
router.get('/test-email', async (req, res) => {
  const target = req.query.to || 'jresendizr002@alumno.uaemex.mx';
  try {
    const info = await sendVerificationOTP(target, '999888', 'Prueba Diagnóstico Render');
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

// Notificación de nuevo mensaje por correo
router.post('/notify-message', async (req, res) => {
  const { toEmail, recipientName, senderName, productTitle, messageText } = req.body;
  if (!toEmail) return res.status(400).json({ success: false, error: 'toEmail es obligatorio' });
  try {
    sendMessageNotificationEmail(toEmail, recipientName, senderName, productTitle, messageText).catch(e => console.warn(e));
    res.json({ success: true, message: 'Notificación despachada' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rutas protegidas
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
