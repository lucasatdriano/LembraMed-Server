import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getUserById,
    login,
    logoutSession,
    register,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:userid', authMiddleware, getUserById);
router.post('/:userid/logout', authMiddleware, logoutSession);

export default router;
