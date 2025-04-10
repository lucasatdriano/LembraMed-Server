import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createMedication,
    findMedications,
    getMedicationById,
    updateMedication,
    updateMedicationStatus,
    deleteMedication,
} from '../controllers/medicationController.js';

const router = express.Router();

router.get('/:userid', findMedications);
router.get('/:userid/:medicationId', getMedicationById);
router.post('/:userid', createMedication);
router.put('/:userid/:medicationId', updateMedication);
router.put('/:userid/:medicationId/status', updateMedicationStatus);
router.delete('/:userid/:medicationId', deleteMedication);

export default router;
