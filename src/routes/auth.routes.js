import express from 'express';
import {
    forgotPassword,
    resetPassword,
    refreshMultiAccountToken,
    tokenStatus,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/refresh-token', refreshMultiAccountToken);
router.put('/token-status', tokenStatus);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

export default router;
