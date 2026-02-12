import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    sendNotification,
    getNotifications,
    markAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/send', sendNotification);
router.get('/', getNotifications);
router.patch('/:notificationid/read', markAsRead);

export default router;
