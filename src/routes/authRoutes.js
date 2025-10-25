import express from 'express';
import {
    forgotPassword,
    resetPassword,
    refreshMultiAccountToken,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.post('/refreshtoken', refreshMultiAccountToken);

export default router;
