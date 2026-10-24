import { Router } from 'express';
import { RegionControlController } from '../controllers/regionControl.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAnggota } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../utils/upload.js';
import {
  createTaskPointSchema,
  updateTaskPointSchema,
  createFieldReportSchema,
  respondFieldReportSchema,
} from '../validators/regionControl.validator.js';

export const taskPointRouter = Router();
export const fieldReportRouter = Router();

// Task Points
taskPointRouter.use(authenticate);
taskPointRouter.get('/', RegionControlController.getAllTaskPoints);
taskPointRouter.get('/:id', RegionControlController.getTaskPointById);
taskPointRouter.post('/', isSuperAdmin, validate(createTaskPointSchema), RegionControlController.createTaskPoint);
taskPointRouter.put('/:id', isSuperAdmin, validate(updateTaskPointSchema), RegionControlController.updateTaskPoint);
taskPointRouter.delete('/:id', isSuperAdmin, RegionControlController.deleteTaskPoint);

// Field Reports
fieldReportRouter.use(authenticate);
fieldReportRouter.get('/', RegionControlController.getFieldReports);
fieldReportRouter.post('/', isAnggota, upload.array('media', 5), validate(createFieldReportSchema), RegionControlController.createFieldReport);
fieldReportRouter.patch('/:id/respond', isSuperAdmin, validate(respondFieldReportSchema), RegionControlController.respondFieldReport);

