import express from 'express';
import {
  getAcademicYears,
  getCurrentAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from '../controllers/academicYearController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAcademicYears);
router.get('/current', getCurrentAcademicYear);

router.post('/', protect, authorize('admin'), createAcademicYear);
router.put('/:id', protect, authorize('admin'), updateAcademicYear);
router.delete('/:id', protect, authorize('admin'), deleteAcademicYear);

export default router;
