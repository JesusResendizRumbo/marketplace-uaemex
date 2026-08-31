import { Router } from 'express';
import { getAllFaculties } from '../controllers/facultyController.js';

const router = Router();

router.get('/', getAllFaculties);

export default router;
