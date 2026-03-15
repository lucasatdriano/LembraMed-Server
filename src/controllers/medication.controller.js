import { MedicationDoseService } from '../services/medication/medication-dose.service.js';
import { MedicationHistoryService } from '../services/medication/medication-history.service.js';
import { MedicationService } from '../services/medication/medication.service.js';
import { AppError } from '../utils/errors/app.error.js';
import { validationMedication } from '../utils/validations/medication.validation.js';

export async function findMedications(req, res) {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    const result = await MedicationService.findMedications(
        userId,
        search,
        page,
        limit,
    );

    if (result.medications.length === 0) {
        throw new AppError('Nenhum medicamento encontrado', 404);
    }

    return res.json(result);
}

export async function getMedicationById(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    const medication = await MedicationService.getMedicationById(
        userId,
        medicationid,
    );

    if (!medication) {
        throw new AppError('Medicamento não encontrado', 404);
    }

    return res.json(medication);
}

export async function getMedicationHistory(req, res) {
    const { medicationid } = req.params;
    const { startDate, endDate, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    const result = await MedicationHistoryService.getMedicationHistory(
        userId,
        medicationid,
        { startDate, endDate, status, page, limit },
    );

    return res.json(result);
}

export async function createMedication(req, res) {
    const userId = req.user.userId;

    const validation = validationMedication.medication(req.body);

    if (!validation.isValid) {
        throw new AppError('Dados inválidos', 400);
    }

    const newMedication = await MedicationService.createMedication(
        userId,
        validation.normalized,
    );

    return res.status(201).json(newMedication);
}

export async function registerPendingConfirmation(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    const result = await MedicationDoseService.registerPendingConfirmation(
        userId,
        medicationid,
    );

    return res.json(result);
}

export async function cancelPendingDose(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    const result = await MedicationDoseService.cancelPendingDose(
        userId,
        medicationid,
    );

    return res.json(result);
}

export async function updateMedication(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    const validation = validationMedication.medication(req.body, true);

    if (!validation.isValid) {
        logger.warn(
            {
                errors: validation.errors,
                body: req.body,
            },
            'Validação de update falhou',
        );
        throw new AppError('Dados inválidos', 400);
    }

    const updatedMedication = await MedicationService.updateMedication(
        userId,
        medicationid,
        validation.normalized,
    );

    if (!updatedMedication) {
        throw new AppError('Medicamento não encontrado', 404);
    }

    return res.json(updatedMedication);
}

export async function deleteMedication(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    const result = await MedicationService.deleteMedication(
        userId,
        medicationid,
    );

    if (!result) {
        throw new AppError('Medicamento não encontrado', 404);
    }

    return res.json({
        message: `Medicamento ${result.medicationName} deletado com sucesso.`,
    });
}
