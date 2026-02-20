import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    getDeviceAccounts,
    registerPushSubscription,
    removeDevice,
} from '../controllers/device.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/:deviceid/accounts', getDeviceAccounts);
router.post('/subscription', registerPushSubscription);
router.delete('/:deviceid', removeDevice);

export default router;
