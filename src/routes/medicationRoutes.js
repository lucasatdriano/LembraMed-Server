import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    createMedication,
    deleteMedication,
    findMedications,
    getMedicationById,
    updateMedication,
} from '../controllers/medicationController';

const router = express.Router();

router.get('/', authMiddleware, findMedications);
router.get('/:medicationId', authMiddleware, getMedicationById);
router.post('/', authMiddleware, createMedication);
router.put('/:medicationId', authMiddleware, updateMedication);
router.delete('/:medicationId', authMiddleware, deleteMedication);
