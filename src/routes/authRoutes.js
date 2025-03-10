import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    forgotPassword,
    refreshUserToken,
    resetPassword,
} from '../controllers/authController';

const router = express.Router();

router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword', resetPassword);
router.post('/refreshToken', authMiddleware, refreshUserToken);

export default router;
