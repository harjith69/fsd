import express from 'express';
import { getScoringConfig, updateScoringConfig } from '../controllers/scoringController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getScoringConfig);
router.put('/', protect, authorize('admin'), updateScoringConfig);

export default router;
