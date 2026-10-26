import express from 'express';
import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  submitRecord,
  approveRecord,
  rejectRecord,
} from '../controllers/activityController.js';
import { protect, authorize } from '../middleware/auth.js';

export const createModuleRouter = (moduleName) => {
  const router = express.Router();

  router.use(protect);

  // Set module param for controller
  const setModule = (req, res, next) => {
    req.params.module = moduleName;
    next();
  };

  router.get('/', setModule, listRecords);
  router.post('/', setModule, createRecord);
  router.put('/:id', setModule, updateRecord);
  router.delete('/:id', setModule, deleteRecord);

  router.post('/:id/submit', setModule, submitRecord);
  router.post('/:id/approve', setModule, authorize('hod', 'admin'), approveRecord);
  router.post('/:id/reject', setModule, authorize('hod', 'admin'), rejectRecord);

  return router;
};

// Generic module router for /api/activities/:module or /api/:module
const genericRouter = express.Router();
genericRouter.use(protect);

genericRouter.get('/:module', listRecords);
genericRouter.post('/:module', createRecord);
genericRouter.put('/:module/:id', updateRecord);
genericRouter.delete('/:module/:id', deleteRecord);

genericRouter.post('/:module/:id/submit', submitRecord);
genericRouter.post('/:module/:id/approve', authorize('hod', 'admin'), approveRecord);
genericRouter.post('/:module/:id/reject', authorize('hod', 'admin'), rejectRecord);

export default genericRouter;
