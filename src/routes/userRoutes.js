import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    register,
    loginMultiAccount,
    getUserById,
    logoutAccount,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginMultiAccount);
router.get('/:userid', authenticateToken, getUserById);
router.post('/:userid/logout', authenticateToken, logoutAccount);

export default router;
