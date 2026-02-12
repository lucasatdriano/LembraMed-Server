import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { calculateNextDose } from '../utils/calculateNextDose.js';
import { calcularTolerancia } from '../utils/doseRules.js';

export async function getMedications(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const offset = (page - 1) * limit;

        const { count, rows: medications } =
            await models.Medication.findAndCountAll({
                where: { userid: userId },
                attributes: [
                    'id',
                    'name',
                    'hournextdose',
                    'periodstart',
                    'periodend',
                    'status',
                    'pendingconfirmation',
                    'pendinguntil',
                    'lasttakentime',
                    'createdat',
                ],
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                    {
                        model: models.MedicationHistory,
                        as: 'history',
                        limit: 10,
                        order: [['createdat', 'DESC']],
                    },
                ],
                order: [['hournextdose', 'ASC']],
                limit: parseInt(limit),
                offset: offset,
            });

        res.json({
            medications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + medications.length < count,
                hasPrev: page > 1,
            },
        });
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
        const medication = await models.Medication.findOne({
            where: {
                id: medicationid,
                userid: userId,
            },
            attributes: [
                'id',
                'name',
                'hournextdose',
                'periodstart',
                'periodend',
                'status',
                'pendingconfirmation',
                'pendinguntil',
                'lasttakentime',
                'createdat',
            ],
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['id', 'intervalinhours'],
                },
                {
                    model: models.MedicationHistory,
                    as: 'history',
                    order: [['createdat', 'DESC']],
                    limit: 20,
                },
            ],
        });

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
        const whereClause = { userid: userId };
        const offset = (page - 1) * limit;

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

        const { count, rows: medications } =
            await models.Medication.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'name',
                    'hournextdose',
                    'periodstart',
                    'periodend',
                    'status',
                    'pendingconfirmation',
                    'pendinguntil',
                    'createdat',
                ],
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
                limit: parseInt(limit),
                offset: offset,
            });

        if (medications.length === 0) {
            return res.status(404).json({
                error: 'Nenhum medicamento encontrado',
            });
        }

        res.json({
            medications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + medications.length < count,
                hasPrev: page > 1,
            },
        });
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
        const medication = await models.Medication.findOne({
            where: {
                id: medicationid,
                userid: userId,
            },
        });

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        const whereClause = { medicationid };

        if (startDate || endDate) {
            whereClause.takendate = {};
            if (startDate) whereClause.takendate[Op.gte] = new Date(startDate);
            if (endDate) whereClause.takendate[Op.lte] = new Date(endDate);
        }

        if (status && status !== 'all') {
            whereClause.taken = status === 'taken';
        }

        const offset = (page - 1) * limit;

        const { count, rows: history } =
            await models.MedicationHistory.findAndCountAll({
                where: whereClause,
                order: [['takendate', 'DESC']],
                limit: parseInt(limit),
                offset: offset,
            });

        res.json({
            history,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + history.length < count,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
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
        let doseInterval = await models.DoseIntervals.findOne({
            where: { intervalinhours },
        });

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalinhours,
            });
        }

        const hournextdose = calculateNextDose(hourfirstdose, intervalinhours);

        const newMedication = await models.Medication.create({
            name: name.toLowerCase(),
            hourfirstdose,
            periodstart,
            periodend,
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
            lasttakentime: null,
            userid: userId,
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
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        res.status(201).json(medicationWithDetails);
    } catch (error) {
        console.error('Erro ao criar medicamento:', error);
        res.status(500).json({
            error: 'Erro ao criar medicamento.',
            details: error.message,
        });
    }
}

/**
 * 🟢 PASSO 1: Usuário clica "Tomei" (duplo clique)
 * - Marca como pendente de confirmação
 * - Adiciona 3 minutos ao horário correto
 * - Se tiver adiantado, aguarda até horário correto + 3
 */
export async function registerPendingConfirmation(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        const medication = await models.Medication.findOne({
            where: { id: medicationid, userid: userId },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        const agora = new Date();
        const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
        const horaCorreta = medication.hournextdose;

        // ⏱️ CORREÇÃO: SEMPRE adiciona 3 minutos a partir de AGORA!
        const pendingUntil = new Date(agora.getTime() + 3 * 60 * 1000);

        // ✅ Marca como aguardando confirmação
        await medication.update({
            status: true, // Aguardando confirmação
            pendingconfirmation: true,
            pendinguntil: pendingUntil,
            // ⚠️ NÃO muda hournextdose ainda!
        });

        const mensagem =
            horaAtual < horaCorreta
                ? 'Dose adiantada. Aguardando confirmação de 3 minutos.'
                : 'Dose registrada. Aguardando confirmação de 3 minutos.';

        res.json({
            message: mensagem,
            medication: {
                id: medication.id,
                name: medication.name,
                status: true,
                pendingconfirmation: true,
                pendinguntil: pendingUntil,
                hournextdose: horaCorreta, // Continua mostrando o horário correto
                doseinterval: medication.doseinterval,
            },
        });
    } catch (error) {
        console.error('Erro ao registrar confirmação pendente:', error);
        res.status(500).json({ error: 'Erro ao registrar confirmação' });
    }
}

/**
 * 🔴 Cancelar confirmação pendente
 * - Usuário desistiu de tomar
 * - Não registra no histórico
 * - Não muda o horário
 */
export async function cancelPendingDose(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId; // 🔴 ADICIONAR ISSO!

    try {
        const medication = await models.Medication.findOne({
            where: {
                id: medicationid,
                userid: userId, // 🔴 FILTRAR PELO USUÁRIO!
            },
        });

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        await medication.update({
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
        });

        res.json({
            message: 'Confirmação cancelada',
            medication: {
                id: medication.id,
                name: medication.name,
                status: false,
                hournextdose: medication.hournextdose,
            },
        });
    } catch (error) {
        console.error('Erro ao cancelar confirmação:', error);
        res.status(500).json({ error: 'Erro ao cancelar confirmação' });
    }
}

export async function updateMedication(req, res) {
    const { medicationid } = req.params;
    const { name, hournextdose, periodstart, periodend, intervalinhours } =
        req.body;
    const userId = req.user.userId;

    try {
        const medication = await models.Medication.findOne({
            where: { id: medicationid, userid: userId },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        const updates = {};
        if (name) updates.name = name.toLowerCase();
        if (hournextdose) updates.hournextdose = hournextdose;
        if (periodstart) updates.periodstart = periodstart;
        if (periodend) updates.periodend = periodend;

        if (intervalinhours) {
            let doseInterval = await models.DoseIntervals.findOne({
                where: { intervalinhours },
            });

            if (!doseInterval) {
                doseInterval = await models.DoseIntervals.create({
                    intervalinhours,
                });
            }

            updates.doseintervalid = doseInterval.id;

            // Recalcula próximo horário baseado no novo intervalo
            const agora = new Date();
            const horaAtual = `${agora.getHours()}:${agora.getMinutes()}`;

            updates.hournextdose = calculateNextDose(
                horaAtual,
                intervalinhours,
            );
        }

        await medication.update(updates);

        const updatedMedication = await models.Medication.findByPk(
            medicationid,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        res.json(updatedMedication);
    } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
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
        const medication = await models.Medication.findOne({
            where: { id: medicationid, userid: userId },
        });

        if (!medication) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        const medicationName = medication.name;
        await medication.destroy();

        res.json({
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
