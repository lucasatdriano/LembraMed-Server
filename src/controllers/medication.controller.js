import { MedicationService } from '../services/medication.service.js';
import { validationMedication } from '../utils/validations/medication.validation.js';

export async function getMedications(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.getMedications(
            userId,
            page,
            limit,
        );

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamentos.',
            details: error.message,
        });
    }
}

export async function getMedicationById(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        const medication = await MedicationService.getMedicationById(
            userId,
            medicationid,
        );

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        res.json(medication);
    } catch (error) {
        console.error('Erro ao buscar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamento.',
            details: error.message,
        });
    }
}

export async function findMedications(req, res) {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.findMedications(
            userId,
            search,
            page,
            limit,
        );

        if (result.medications.length === 0) {
            return res.status(404).json({
                error: 'Nenhum medicamento encontrado',
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamentos.',
            details: error.message,
        });
    }
}

export async function getMedicationHistory(req, res) {
    const { medicationid } = req.params;
    const { startDate, endDate, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.getMedicationHistory(
            userId,
            medicationid,
            { startDate, endDate, status, page, limit },
        );

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);

        if (error.message === 'Medicamento não encontrado') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({
            error: 'Erro ao buscar o histórico do medicamento.',
            details: error.message,
        });
    }
}

export async function createMedication(req, res) {
    const { name, hourfirstdose, periodstart, periodend, intervalinhours } =
        req.body;
    const userId = req.user.userId;

    try {
        const validationResult = validationMedication.medication({
            name,
            hourfirstdose,
            periodstart,
            periodend,
            intervalinhours,
        });

        if (!validationResult.isValid) {
            console.log('❌ Erros de validação:', validationResult.errors);
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationResult.errors,
            });
        }

        const newMedication = await MedicationService.createMedication(userId, {
            name,
            hourfirstdose,
            periodstart,
            periodend,
            intervalinhours,
        });

        res.status(201).json(newMedication);
    } catch (error) {
        console.error('❌ Erro ao criar medicamento:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map((e) => e.message),
            });
        }

        res.status(500).json({
            error: 'Erro ao criar medicamento.',
            details: error.message,
        });
    }
}

export async function registerPendingConfirmation(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.registerPendingConfirmation(
            userId,
            medicationid,
        );

        res.json(result);
    } catch (error) {
        console.error(`🔴 [REGISTER_PENDING] ERRO:`, error);

        if (error.message === 'Medicamento não encontrado') {
            return res.status(404).json({ error: error.message });
        }

        if (
            error.message.includes('Aguarde o intervalo mínimo') ||
            error.message.includes('dose já está perdida')
        ) {
            return res.status(400).json({
                error: error.message,
                message: error.details?.message,
                details: error.details,
            });
        }

        res.status(500).json({ error: 'Erro ao registrar confirmação' });
    }
}

export async function cancelPendingDose(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.cancelPendingDose(
            userId,
            medicationid,
        );

        res.json(result);
    } catch (error) {
        console.error(`🟠 [CANCEL_PENDING] ERRO:`, error);

        if (error.message === 'Medicamento não encontrado') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Erro ao cancelar confirmação' });
    }
}

export async function updateMedication(req, res) {
    const { medicationid } = req.params;
    const { name, hournextdose, periodstart, periodend, intervalinhours } =
        req.body;
    const userId = req.user.userId;

    try {
        const errors = [];

        if (name) {
            const nameValidation = validationMedication.name(name);
            errors.push(...nameValidation.errors);
        }

        if (hournextdose) {
            const timeValidation = validationMedication.time(hournextdose);
            errors.push(...timeValidation.errors);
        }

        if (intervalinhours) {
            const intervalValidation =
                validationMedication.interval(intervalinhours);
            errors.push(...intervalValidation.errors);
        }

        if (periodstart || periodend) {
            const periodValidation = validationMedication.period(
                periodstart,
                periodend,
            );
            errors.push(...periodValidation.errors);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors,
            });
        }

        const updatedMedication = await MedicationService.updateMedication(
            userId,
            medicationid,
            { name, hournextdose, periodstart, periodend, intervalinhours },
        );

        if (!updatedMedication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        res.json(updatedMedication);
    } catch (error) {
        console.error('❌ Erro ao atualizar medicamento:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map((e) => e.message),
            });
        }

        res.status(500).json({
            error: 'Erro ao atualizar medicamento.',
            details: error.message,
        });
    }
}

export async function deleteMedication(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        const result = await MedicationService.deleteMedication(
            userId,
            medicationid,
        );

        if (!result) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        res.json({
            message: `Medicamento ${result.medicationName} deletado com sucesso.`,
        });
    } catch (error) {
        console.error('Erro ao deletar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao deletar medicamento.',
            details: error.message,
        });
    }
}
