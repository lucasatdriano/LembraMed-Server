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
router.get('/:userid/:medicationid', getMedicationById);
router.get('/:userid/:medicationid/history', getMedicationHistory);
router.post('/:userid', createMedication);
router.post('/:userid/:medicationid/missed', registerMissedDose);
router.put('/:userid/:medicationid', updateMedication);
router.put('/:userid/:medicationid/status', updateMedicationStatus);
router.delete('/:userid/:medicationid', deleteMedication);

export default router;
