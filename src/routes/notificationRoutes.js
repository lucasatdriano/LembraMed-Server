import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    sendUserNotification,
    getUserNotifications,
    markAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/send', sendUserNotification);
router.get('/user/:userid', getUserNotifications);
router.patch('/:notificationid/read', markAsRead);

export default router;
