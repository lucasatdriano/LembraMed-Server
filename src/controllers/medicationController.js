import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { calculateNextDose } from '../utils/helpers/calculateNextDose.js';
import { timezone } from '../utils/formatters/timezone.js';
import { calcularTolerancia } from '../utils/helpers/doseRules.js';
import { validationMedication } from '../utils/validations/medicationValidation.js';

export async function getMedications(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

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
                    [
                        Sequelize.literal(`
                            EXTRACT(HOUR FROM hournextdose) * 60 + 
                            EXTRACT(MINUTE FROM hournextdose)
                        `),
                        'nextdoseminutes',
                    ],
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
                order: [[Sequelize.literal('nextdoseminutes'), 'ASC']],
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
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

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
                order: [['hournextdose', 'ASC']],
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
            if (startDate)
                whereClause.takendate[Op.gte] = timezone.now(startDate);
            if (endDate) whereClause.takendate[Op.lte] = timezone.now(endDate);
        }

        if (status && status !== 'all') {
            whereClause.taken = status === 'taken';
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

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

        let doseInterval = await models.DoseIntervals.findOne({
            where: { intervalinhours },
        });

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalinhours,
            });
        }

        const adjustedPeriodStart = timezone.startOfDay(periodstart);
        const adjustedPeriodEnd = timezone.endOfDay(periodend);

        const newMedication = await models.Medication.create({
            name: name.toLowerCase().trim(),
            hourfirstdose,
            periodstart: adjustedPeriodStart,
            periodend: adjustedPeriodEnd,
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
            lasttakentime: null,
            userid: userId,
            doseintervalid: doseInterval.id,
            hournextdose: hourfirstdose,
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

/**
 * 🟢 PASSO 1: Usuário clica "Tomei" (duplo clique)
 * - Marca como pendente de confirmação
 * - Adiciona 3 minutos ao horário correto
 */
export async function registerPendingConfirmation(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        console.log(`\n🔵 [REGISTER_PENDING] ========== INÍCIO ==========`);
        console.log(`🔵 [REGISTER_PENDING] Medicamento ID: ${medicationid}`);
        console.log(`🔵 [REGISTER_PENDING] Usuário ID: ${userId}`);

        const agora = timezone.now();
        console.log(`🔵 [REGISTER_PENDING] Timestamp: ${agora.toISOString()}`);

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
            console.log(`🔴 [REGISTER_PENDING] Medicamento NÃO encontrado!`);
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        console.log(
            `🔵 [REGISTER_PENDING] Medicamento encontrado: ${medication.name}`,
        );
        console.log(`🔵 [REGISTER_PENDING] Estado ATUAL:`);
        console.log(`   - status: ${medication.status}`);
        console.log(
            `   - pendingconfirmation: ${medication.pendingconfirmation}`,
        );
        console.log(`   - pendinguntil: ${medication.pendinguntil}`);
        console.log(`   - hournextdose: ${medication.hournextdose}`);

        const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
        const horaCorreta = medication.hournextdose;

        const [horas, minutos] = horaCorreta.split(':').map(Number);
        const horarioProgramado = new Date(agora);
        horarioProgramado.setHours(horas, minutos, 0, 0);

        const toleranciaMinutos = calcularTolerancia(
            medication.doseinterval.intervalinhours,
        );

        const diffMinutos =
            (agora.getTime() - horarioProgramado.getTime()) / (60 * 1000);

        console.log(
            `🔵 [REGISTER_PENDING] Horário programado: ${horarioProgramado.toISOString()}`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Diferença: ${Math.round(diffMinutos)} minutos`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Tolerância: ${toleranciaMinutos} minutos`,
        );

        if (diffMinutos > toleranciaMinutos) {
            console.log(
                `🔴 [REGISTER_PENDING] DOSE JÁ PERDIDA! Não pode marcar como tomada.`,
            );
            return res.status(400).json({
                error: 'Esta dose já está perdida. A próxima dose será no horário calculado.',
            });
        }

        let pendingUntil;
        let mensagem;

        if (diffMinutos < 0) {
            pendingUntil = new Date(
                horarioProgramado.getTime() + 3 * 60 * 1000,
            );
            mensagem = `Dose adiantada. Aguardando confirmação às ${pendingUntil.getHours().toString().padStart(2, '0')}:${pendingUntil.getMinutes().toString().padStart(2, '0')}.`;
            console.log(`🔵 [REGISTER_PENDING] Clique ANTES do horário`);
        } else {
            // Caso 2: Clique DEPOIS do horário programado (mas dentro da tolerância)
            // pendingUntil = agora + 3 minutos
            pendingUntil = new Date(agora.getTime() + 3 * 60 * 1000);
            mensagem = 'Dose registrada. Aguardando confirmação de 3 minutos.';
            console.log(
                `🔵 [REGISTER_PENDING] Clique DEPOIS do horário (dentro da tolerância)`,
            );
        }

        console.log(`🔵 [REGISTER_PENDING] Hora atual: ${horaAtual}`);
        console.log(`🔵 [REGISTER_PENDING] Hora correta: ${horaCorreta}`);
        console.log(
            `🔵 [REGISTER_PENDING] pendingUntil: ${pendingUntil.toISOString()}`,
        );

        await medication.update({
            status: true,
            pendingconfirmation: true,
            pendinguntil: pendingUntil,
        });

        console.log(`🟢 [REGISTER_PENDING] Medicamento ATUALIZADO:`);
        console.log(`   - status: true`);
        console.log(`   - pendingconfirmation: true`);
        console.log(`   - pendinguntil: ${pendingUntil}`);
        console.log(
            `   - hournextdose: ${medication.hournextdose} (NÃO ALTERADO)`,
        );

        console.log(`🔵 [REGISTER_PENDING] Mensagem: ${mensagem}`);
        console.log(`🔵 [REGISTER_PENDING] ========== FIM ==========\n`);

        res.json({
            message: mensagem,
            medication: {
                id: medication.id,
                name: medication.name,
                status: true,
                pendingconfirmation: true,
                pendinguntil: pendingUntil,
                hournextdose: horaCorreta,
                doseinterval: medication.doseinterval,
            },
        });
    } catch (error) {
        console.error(`🔴 [REGISTER_PENDING] ERRO:`, error);
        res.status(500).json({ error: 'Erro ao registrar confirmação' });
    }
}

export async function cancelPendingDose(req, res) {
    const { medicationid } = req.params;
    const userId = req.user.userId;

    try {
        console.log(`\n🟠 [CANCEL_PENDING] ========== INÍCIO ==========`);
        console.log(`🟠 [CANCEL_PENDING] Medicamento ID: ${medicationid}`);
        console.log(`🟠 [CANCEL_PENDING] Usuário ID: ${userId}`);
        console.log(
            `🟠 [CANCEL_PENDING] Timestamp: ${timezone.now().toISOString()}`,
        );

        const medication = await models.Medication.findOne({
            where: {
                id: medicationid,
                userid: userId,
            },
        });

        if (!medication) {
            console.log(`🟠 [CANCEL_PENDING] Medicamento NÃO encontrado!`);
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        console.log(
            `🟠 [CANCEL_PENDING] Medicamento encontrado: ${medication.name}`,
        );
        console.log(`🟠 [CANCEL_PENDING] Estado ANTES do cancelamento:`);
        console.log(`   - status: ${medication.status}`);
        console.log(
            `   - pendingconfirmation: ${medication.pendingconfirmation}`,
        );
        console.log(`   - pendinguntil: ${medication.pendinguntil}`);

        await medication.update({
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
        });

        console.log(`🟢 [CANCEL_PENDING] Medicamento APÓS cancelamento:`);
        console.log(`   - status: false`);
        console.log(`   - pendingconfirmation: false`);
        console.log(`   - pendinguntil: null`);
        console.log(
            `   - hournextdose: ${medication.hournextdose} (NÃO ALTERADO)`,
        );
        console.log(`🟠 [CANCEL_PENDING] ========== FIM ==========\n`);

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
        console.error(`🟠 [CANCEL_PENDING] ERRO:`, error);
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
        if (name) updates.name = name.toLowerCase().trim();
        if (hournextdose) updates.hournextdose = hournextdose;

        if (periodstart) {
            updates.periodstart = timezone.startOfDay(periodstart);
        }

        if (periodend) {
            updates.periodend = timezone.endOfDay(periodend);
        }

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

            if (!hournextdose && medication.hournextdose) {
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
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        res.json(updatedMedication);
    } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);

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
