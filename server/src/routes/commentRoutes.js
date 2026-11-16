import express from 'express';
import { getCommentsByTask, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/task/:taskId', getCommentsByTask);
router.post('/', addComment);
router.delete('/:id', deleteComment);

export default router;

