import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/handlers/async-handler.js';
import {
    register,
    loginMultiAccount,
    getUserById,
    logoutAccount,
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(loginMultiAccount));
router.get('/', authenticateToken, asyncHandler(getUserById));
router.post('/logout', authenticateToken, asyncHandler(logoutAccount));

export default router;
