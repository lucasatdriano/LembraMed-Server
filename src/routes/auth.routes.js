import express from 'express';
import { asyncHandler } from '../utils/handlers/async-handler.js';
import {
    forgotPassword,
    resetPassword,
    refreshMultiAccountToken,
    tokenStatus,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/refresh-token', asyncHandler(refreshMultiAccountToken));
router.get('/token-status', asyncHandler(tokenStatus));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.put('/reset-password', asyncHandler(resetPassword));

export default router;
