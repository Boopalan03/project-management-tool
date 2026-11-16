import express from 'express';
import {
  getTasksByProject,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.patch('/:id/status', updateTaskStatus);
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;

