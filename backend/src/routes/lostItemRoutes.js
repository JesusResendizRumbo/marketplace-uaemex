import { Router } from 'express';
import { 
  getAllLostItems, 
  createLostItem, 
  resolveLostItem 
} from '../controllers/lostItemController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.get('/', getAllLostItems);

// Rutas privadas
router.post('/', requireAuth, createLostItem);
router.patch('/:id/resolve', requireAuth, resolveLostItem);

export default router;
