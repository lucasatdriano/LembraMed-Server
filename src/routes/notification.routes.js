import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    sendNotification,
    getNotifications,
    markAsRead,
} from '../controllers/notification.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/send', sendNotification);
router.get('/', getNotifications);
router.patch('/:notificationid/read', markAsRead);

export default router;
