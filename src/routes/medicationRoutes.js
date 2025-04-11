import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createMedication,
    findMedications,
    getMedicationById,
    getMedicationHistory,
    updateMedication,
    updateMedicationStatus,
    deleteMedication,
    registerMissedDose,
} from '../controllers/medicationController.js';

const router = express.Router();

router.get('/:userid', findMedications);
router.get('/:userid/:medicationId', getMedicationById);
router.get('/:userid/:medicationId/history', getMedicationHistory);
router.post('/:userid', createMedication);
router.post('/:userid/:medicationId/missed', registerMissedDose);
router.put('/:userid/:medicationId', updateMedication);
router.patch('/:userid/:medicationId/status', updateMedicationStatus);
router.delete('/:userid/:medicationId', deleteMedication);

export default router;
