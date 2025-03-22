import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createMedication,
    deleteMedication,
    findMedications,
    getMedicationById,
    updateMedication,
} from '../controllers/medicationController.js';

const router = express.Router();

router.get('/:userid', authMiddleware, findMedications);
router.get('/:userid/:medicationId', authMiddleware, getMedicationById);
router.post('/:userid', authMiddleware, createMedication);
router.put('/:userid/:medicationId', authMiddleware, updateMedication);
router.delete('/:userid/:medicationId', authMiddleware, deleteMedication);

export default router;
