import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { calculateNextDose } from '../utils/calculateNextDose.js';

export async function getUserMedications(req, res) {
    const { userid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res
                .status(403)
                .json({ error: 'Acesso não autorizado a esta conta' });
        }

        const medications = await models.Medication.findAll({
            where: { userid },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['id', 'description', 'intervalinhours'],
                },
                {
                    model: models.MedicationHistory,
                    as: 'history',
                    limit: 10,
                    order: [['createdat', 'DESC']],
                },
            ],
            order: [['hournextdose', 'ASC']],
        });

        res.json({ success: true, medications });
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamentos.',
            details: error.message,
        });
    }
}

export async function getMedicationById(req, res) {
    const { userid, medicationid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid, {
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['id', 'intervalinhours', 'description'],
                },
                {
                    model: models.MedicationHistory,
                    as: 'history',
                    order: [['createdat', 'DESC']],
                    limit: 20,
                },
            ],
        });

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        res.json({ success: true, medication });
    } catch (error) {
        console.error('Erro ao buscar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamento.',
            details: error.message,
        });
    }
}

export async function findMedications(req, res) {
    const { userid } = req.params;
    const { search } = req.query;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const whereClause = { userid };

        if (search) {
            const searchLower = search.toLowerCase();

            const orConditions = [{ name: { [Op.like]: `%${searchLower}%` } }];

            if (!isNaN(Number(search))) {
                orConditions.push(
                    Sequelize.where(
                        Sequelize.col('doseinterval.intervalinhours'),
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
                    as: 'doseinterval',
                    attributes: ['intervalinhours', 'description'],
                },
            ],
        });

        if (medications.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum medicamento encontrado',
            });
        }

        res.json({ success: true, medications });
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({
            error: 'Erro ao buscar medicamentos.',
            details: error.message,
        });
    }
}

export async function getMedicationHistory(req, res) {
    const { userid, medicationid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid);

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        const history = await models.MedicationHistory.findAll({
            where: { medicationid },
            order: [['createdat', 'DESC']],
            limit: 50,
        });

        res.json({ success: true, history });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            error: 'Erro ao buscar o histórico do medicamento.',
            details: error.message,
        });
    }
}

export async function createMedication(req, res) {
    const { userid } = req.params;
    const { name, hourfirstdose, periodstart, periodend, intervalinhours } =
        req.body;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        let doseInterval = await models.DoseIntervals.findOne({
            where: { intervalinhours },
        });

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalinhours,
                description: `Cada ${intervalinhours} horas`,
            });
        }

        const hournextdose = calculateNextDose(hourfirstdose, intervalinhours);

        const newMedication = await models.Medication.create({
            name: name.toLowerCase(),
            hourfirstdose,
            periodstart,
            periodend,
            status: false,
            userid,
            doseintervalid: doseInterval.id,
            hournextdose,
        });

        const medicationWithDetails = await models.Medication.findByPk(
            newMedication.id,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours', 'description'],
                    },
                ],
            },
        );

        res.status(201).json({
            success: true,
            message: 'Medicamento criado com sucesso',
            medication: medicationWithDetails,
        });
    } catch (error) {
        console.error('Erro ao criar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao criar medicamento.',
            details: error.message,
        });
    }
}

export async function markAsTaken(req, res) {
    const { userid, medicationid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid, {
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        await models.MedicationHistory.create({
            medicationid,
            action: 'taken',
            details: 'Marcado como tomado pelo usuário',
            takendate: new Date(),
            taken: true,
        });

        await medication.update({ status: true });

        // TODO: Agendar job para daqui 10 minutos
        // para verificar e atualizar automaticamente

        const nextDoseTime = calculateNextDose(
            medication.hournextdose,
            medication.doseinterval.intervalinhours,
        );

        res.json({
            success: true,
            message: 'Medicamento marcado como tomado',
            medication: {
                id: medication.id,
                name: medication.name,
                status: true,
                hournextdose: medication.hournextdose,
                nextDose: nextDoseTime,
            },
        });
    } catch (error) {
        console.error('Erro ao marcar como tomado:', error);
        res.status(500).json({
            error: 'Erro ao marcar medicamento como tomado',
            details: error.message,
        });
    }
}

export async function registerMissedDose(req, res) {
    const { userid, medicationid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid);

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        await models.MedicationHistory.create({
            medicationid,
            action: 'missed',
            details: 'Dose não tomada registrada',
            takendate: new Date(),
            taken: false,
        });

        res.json({
            success: true,
            message: 'Dose não tomada registrada no histórico',
        });
    } catch (error) {
        console.error('Erro ao registrar dose não tomada:', error);
        res.status(500).json({
            error: 'Erro ao registrar dose não tomada',
            details: error.message,
        });
    }
}

export async function updateMedication(req, res) {
    const { userid, medicationid } = req.params;
    const {
        name,
        hournextdose,
        periodstart,
        periodend,
        intervalinhours,
        status,
    } = req.body;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid, {
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        const updates = {};
        if (name) updates.name = name.toLowerCase();
        if (hournextdose) updates.hournextdose = hournextdose;
        if (status !== undefined) updates.status = status;
        if (periodstart) updates.periodstart = periodstart;
        if (periodend) updates.periodend = periodend;

        if (intervalinhours) {
            let doseInterval = await models.DoseIntervals.findOne({
                where: { intervalinhours },
            });

            if (!doseInterval) {
                doseInterval = await models.DoseIntervals.create({
                    intervalinhours,
                    description: `Cada ${intervalinhours} horas`,
                });
            }

            updates.doseintervalid = doseInterval.id;

            const now = new Date();
            const createdat = new Date(medication.createdat);
            const isSameDay = now.toDateString() === createdat.toDateString();

            const lastDoseTime = new Date();
            const [lastDoseHours, lastDoseMinutes] = medication.hournextdose
                .split(':')
                .map(Number);
            lastDoseTime.setHours(lastDoseHours, lastDoseMinutes, 0, 0);

            if (isSameDay && now <= lastDoseTime) {
                updates.hournextdose = calculateNextDose(
                    medication.hourfirstdose,
                    intervalinhours,
                );
            } else {
                updates.hournextdose = calculateNextDose(
                    medication.hournextdose,
                    intervalinhours,
                );
            }
        }

        await medication.update(updates);

        const updatedMedication = await models.Medication.findByPk(
            medicationid,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours', 'description'],
                    },
                ],
            },
        );

        res.json({
            success: true,
            message: 'Medicamento atualizado com sucesso',
            medication: updatedMedication,
        });
    } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao atualizar medicamento.',
            details: error.message,
        });
    }
}

export async function forceDoseAdvance(req, res) {
    const { medicationid } = req.params;
    const { userid } = req.body;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid, {
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication || medication.userid !== userid) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        const newNextDose = calculateNextDose(
            medication.hournextdose,
            medication.doseinterval.intervalinhours,
        );

        await medication.update({
            status: false,
            hournextdose: newNextDose,
        });

        await models.MedicationHistory.create({
            medicationid,
            action: 'auto_advanced',
            details: 'Dose avançada automaticamente após 25 minutos',
        });

        res.json({
            success: true,
            message: 'Dose avançada com sucesso',
            medication: {
                id: medication.id,
                name: medication.name,
                status: false,
                hournextdose: newNextDose,
            },
        });
    } catch (error) {
        console.error('Erro ao forçar avanço de dose:', error);
        res.status(500).json({
            error: 'Erro ao forçar avanço de dose',
            details: error.message,
        });
    }
}

export async function deleteMedication(req, res) {
    const { userid, medicationid } = req.params;

    try {
        const tokenUserId = req.user.userId;
        if (tokenUserId !== userid) {
            return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        const medication = await models.Medication.findByPk(medicationid);

        if (!medication || medication.userid !== userid) {
            return res.status(404).json({
                error: 'Medicamento não encontrado.',
            });
        }

        const medicationName = medication.name;

        await medication.destroy();

        res.json({
            success: true,
            message: `Medicamento ${medicationName} deletado com sucesso.`,
        });
    } catch (error) {
        console.error('Erro ao deletar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao deletar medicamento.',
            details: error.message,
        });
    }
}
