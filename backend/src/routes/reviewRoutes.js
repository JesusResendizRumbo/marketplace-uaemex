import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/user/:userId', getUserReviews);
router.post('/', requireAuth, createReview);

export default router;
