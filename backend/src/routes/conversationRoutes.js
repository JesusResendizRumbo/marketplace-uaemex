import { Router } from 'express';
import { 
  getOrCreateConversation, 
  getUserConversations, 
  getMessages, 
  sendMessage 
} from '../controllers/conversationController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas de chat requieren autenticación JWT
router.use(requireAuth);

router.post('/', getOrCreateConversation);
router.get('/', getUserConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
