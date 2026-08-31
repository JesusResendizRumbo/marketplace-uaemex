import { Router } from 'express';
import { createPaymentCheckout, validateSellerDeliveryCode } from '../controllers/paymentController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Todas las operaciones de pago requieren inicio de sesión con correo institucional
router.use(requireAuth);

router.post('/checkout', createPaymentCheckout);
router.post('/validate-delivery-code', validateSellerDeliveryCode);

export default router;
