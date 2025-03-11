import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getUserById,
    login,
    logoutUser,
    register,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:userId', authMiddleware, getUserById);
router.delete('/:userId/logout', authMiddleware, logoutUser);

export default router;
