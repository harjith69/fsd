import express from 'express';
import { getFacultyReport, getDepartmentReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/faculty/:id', getFacultyReport);
router.get('/department/:id', authorize('hod', 'admin'), getDepartmentReport);

export default router;
