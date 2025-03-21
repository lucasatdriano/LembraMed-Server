import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';

export async function getMedications(req, res) {
    const { userId } = req.params;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const medications = await models.Medication.findAll({
            where: { userId: userId },
        });

        res.json(medications);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contatos.',
            details: error.message,
        });
    }
}

export async function getMedicationById(req, res) {
    const { userId, medicationId } = req.params;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const medication = await models.Medication.findByPk(medicationId, {
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseInterval',
                    attributes: ['intervalInHours'],
                },
            ],
        });

        if (!medication || medication.userId !== userId) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        if (!medication.doseInterval) {
            return res.status(404).json({
                error: 'Intervalo de dose não encontrado para este medicamento.',
            });
        }

        const response = {
            id: medication.id,
            name: medication.name,
            hourFirstDose: medication.hourFirstDose,
            periodStart: medication.periodStart,
            periodEnd: medication.periodEnd,
            userId: medication.userId,
            doseIntervalId: medication.doseIntervalId,
            intervalInHours: medication.doseInterval.intervalInHours,
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar medicamento.',
            details: error.message,
        });
    }
}

export async function findMedications(req, res) {
    const { userId } = req.params;
    const { search } = req.query;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const whereClause = { userId };

        if (search) {
            const orConditions = [{ name: { [Op.like]: `%${search}%` } }];

            if (!isNaN(Number(search))) {
                orConditions.push(
                    Sequelize.where(
                        Sequelize.col('doseInterval.intervalInHours'),
                        Number(search),
                    ),
                );
            }

            whereClause[Op.or] = orConditions;
        }

        const medications = await models.Medication.findAll({
            where: whereClause,
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseInterval',
                    attributes: ['intervalInHours'],
                },
            ],
        });

        if (medications.length === 0) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        const response = medications.map((medication) => medication.toJSON());

        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar medicamento.',
            details: error.message,
        });
    }
}

export async function createMedication(req, res) {
    const { userId } = req.params;
    const { name, hourFirstDose, periodStart, periodEnd, intervalInHours } =
        req.body;

    try {
        let doseInterval = await models.DoseIntervals.findOne({
            where: { intervalInHours },
        });

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalInHours,
            });
        }

        const newMedication = await models.Medication.create({
            name,
            hourFirstDose,
            periodStart,
            periodEnd,
            userId,
            doseIntervalId: doseInterval.id,
        });

        res.status(201).json({
            medication: newMedication,
            intervalInHours: doseInterval.intervalInHours,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao criar medicamento.',
            details: error.message,
        });
    }
}

export async function updateMedication(req, res) {
    const { userId, medicationId } = req.params;
    const { name, hourFirstDose, periodStart, periodEnd, intervalInHours } =
        req.body;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userId !== userId) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        medication.name = name || medication.name;
        medication.hourFirstDose = hourFirstDose || medication.hourFirstDose;

        if (periodStart && !isNaN(new Date(periodStart).getTime())) {
            medication.periodStart = periodStart;
        }

        if (periodEnd && !isNaN(new Date(periodEnd).getTime())) {
            medication.periodEnd = periodEnd;
        }

        if (intervalInHours) {
            let doseInterval = await models.DoseIntervals.findOne({
                where: { intervalInHours: intervalInHours },
            });

            if (!doseInterval) {
                doseInterval = await models.DoseIntervals.create({
                    intervalInHours,
                });
            }

            medication.doseIntervalId = doseInterval.id;
        }

        await medication.save();

        res.status(200).json(medication);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao atualizar medicamento.',
            details: error.message,
        });
    }
}

export async function deleteMedication(req, res) {
    const { userId, medicationId } = req.params;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userId !== userId) {
            return res.status(404).json({
                error: 'Medicamento não encontrado.',
            });
        }

        const nameMedication = medication.name;

        await medication.destroy();

        res.status(200).json({
            message: `Medicamento ${nameMedication} deletado com sucesso.`,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao deletar medicamento.',
            details: error.message,
        });
    }
}
