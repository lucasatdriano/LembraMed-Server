import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    findMedications,
    getMedicationById,
    getMedicationHistory,
    createMedication,
    registerPendingConfirmation,
    cancelPendingDose,
    updateMedication,
    deleteMedication,
} from '../controllers/medication.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/search', findMedications);
router.get('/:medicationid', getMedicationById);
router.get('/:medicationid/history', getMedicationHistory);
router.post('/create', createMedication);
router.post('/:medicationid/pending', registerPendingConfirmation);
router.post('/:medicationid/cancel', cancelPendingDose);
router.put('/:medicationid', updateMedication);
router.delete('/:medicationid', deleteMedication);

export default router;
