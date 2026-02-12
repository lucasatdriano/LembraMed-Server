import express from 'express';
import {
    forgotPassword,
    resetPassword,
    refreshMultiAccountToken,
    tokenStatus,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/refreshtoken', refreshMultiAccountToken);
router.put('/tokenstatus', tokenStatus);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);

export default router;
