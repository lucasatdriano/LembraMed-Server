import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    sendNotification,
    getNotifications,
    markAsRead,
    subscribe,
    unsubscribe,
    getVapidPublicKey,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);

router.use(authenticateToken);

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/send', sendNotification);
router.get('/', getNotifications);
router.patch('/:notificationid/read', markAsRead);

export default router;
