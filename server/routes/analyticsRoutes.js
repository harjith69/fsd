import express from 'express';
import {
  getFacultyAnalytics,
  getDepartmentAnalytics,
  getInstitutionAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/faculty/:id', getFacultyAnalytics);
router.get('/department/:id', authorize('hod', 'admin'), getDepartmentAnalytics);
router.get('/institution', authorize('admin'), getInstitutionAnalytics);

export default router;
