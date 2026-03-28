import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/handlers/async-handler.js';
import {
    getVapidPublicKey,
    subscribe,
    unsubscribe,
    sendNotification,
    getNotifications,
    markAsRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/vapid-public-key', asyncHandler(getVapidPublicKey));

router.use(authenticateToken);

router.post('/subscribe', asyncHandler(subscribe));
router.post('/unsubscribe', asyncHandler(unsubscribe));
router.post('/send', asyncHandler(sendNotification));
router.get('/', asyncHandler(getNotifications));
router.patch('/:notificationid/read', asyncHandler(markAsRead));

export default router;
