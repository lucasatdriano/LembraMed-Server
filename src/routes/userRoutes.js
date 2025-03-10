import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    getUserById,
    login,
    logoutUser,
    register,
} from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:userId', authMiddleware, getUserById);
router.delete('/:userId/logout', authMiddleware, logoutUser);
