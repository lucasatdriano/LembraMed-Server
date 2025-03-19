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

router.get('/:userId', authMiddleware, findMedications);
router.get('/:userId/:medicationId', authMiddleware, getMedicationById);
router.post('/:userId', authMiddleware, createMedication);
router.put('/:userId/:medicationId', authMiddleware, updateMedication);
router.delete('/:userId/:medicationId', authMiddleware, deleteMedication);

export default router;
