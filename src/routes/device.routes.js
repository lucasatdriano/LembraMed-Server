import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/handlers/async-handler.js';

import {
    getDeviceAccounts,
    registerPushSubscription,
    removeDevice,
} from '../controllers/device.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/:deviceid/accounts', asyncHandler(getDeviceAccounts));
router.post('/subscription', asyncHandler(registerPushSubscription));
router.delete('/:deviceid', asyncHandler(removeDevice));

export default router;
