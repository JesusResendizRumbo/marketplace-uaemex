import { Router } from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProductStatus 
} from '../controllers/productController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas privadas
router.post('/', requireAuth, createProduct);
router.patch('/:id/status', requireAuth, updateProductStatus);

export default router;
