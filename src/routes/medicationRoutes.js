import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    findMedications,
    getMedicationById,
    getMedicationHistory,
    createMedication,
    markAsTaken,
    registerMissedDose,
    forceDoseAdvance,
    updateMedication,
    deleteMedication,
} from '../controllers/medicationController.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/:userid/search', findMedications);
router.get('/:userid/:medicationid', getMedicationById);
router.get('/:userid/:medicationid/history', getMedicationHistory);
router.post('/:userid/create', createMedication);
router.post('/:userid/:medicationid/taken', markAsTaken);
router.post('/:userid/:medicationid/missed', registerMissedDose);
router.post('/:userid/:medicationid/advance', forceDoseAdvance);
router.put('/:userid/:medicationid', updateMedication);
router.delete('/:userid/:medicationid', deleteMedication);

export default router;
