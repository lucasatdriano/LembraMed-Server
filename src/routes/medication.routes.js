import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/handlers/async-handler.js';
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

router.get('/search', asyncHandler(findMedications));
router.get('/:medicationid', asyncHandler(getMedicationById));
router.get('/:medicationid/history', asyncHandler(getMedicationHistory));
router.post('/', asyncHandler(createMedication));
router.post(
    '/:medicationid/pending',
    asyncHandler(registerPendingConfirmation),
);
router.post('/:medicationid/cancel', asyncHandler(cancelPendingDose));
router.put('/:medicationid', asyncHandler(updateMedication));
router.delete('/:medicationid', asyncHandler(deleteMedication));

export default router;
