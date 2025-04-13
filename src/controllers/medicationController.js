import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { calculateNextDose } from '../utils/calculateNextDose.js';

export async function getMedications(req, res) {
    const { userid } = req.params;

    // if (!req.authenticatedUser) {
    //     return res.status(401).json({ error: 'Usuário não autenticado.' });
    // }

    try {
        const medications = await models.Medication.findAll({
            where: { userid: userid },
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
    const { userid, medicationId } = req.params;

    // if (!req.authenticatedUser) {
    //     return res.status(401).json({ error: 'Usuário não autenticado.' });
    // }

    try {
        const medication = await models.Medication.findByPk(medicationId, {
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
                .json({ error: 'Medicamento não encontrado' });
        }

        if (!medication.doseinterval) {
            return res.status(404).json({
                error: 'Intervalo de dose não encontrado para este medicamento.',
            });
        }

        res.json(medication);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar medicamento.',
            details: error.message,
        });
    }
}

export async function findMedications(req, res) {
    const { userid } = req.params;
    const { search } = req.query;

    // if (!req.authenticatedUser) {
    //     return res.status(401).json({ error: 'Usuário não autenticado.' });
    // }

    try {
        const whereClause = { userid };

        if (search) {
            const orConditions = [{ name: { [Op.like]: `%${search}%` } }];

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
                    attributes: ['intervalinhours'],
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

export async function getMedicationHistory(req, res) {
    const { userId, medicationId } = req.params;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userid !== userId) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado' });
        }

        const history = await models.MedicationHistory.findAll({
            where: { medicationid: medicationId },
            order: [['createdat', 'DESC']],
        });

        res.status(200).json(history);
    } catch (error) {
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
            name,
            hourfirstdose,
            periodstart,
            periodend,
            status: false,
            userid,
            doseintervalid: doseInterval.id,
            hournextdose,
        });

        res.status(201).json({
            medication: newMedication,
            intervalinhours: doseInterval.intervalinhours,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao criar medicamento.',
            details: error.message,
        });
    }
}

export async function registerMissedDose(req, res) {
    const { userId, medicationId } = req.params;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userid !== userId) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        await models.MedicationHistory.create({
            medicationid: medicationId,
            takendate: new Date(),
            taken: false,
        });

        res.status(200).json({
            message: 'Dose não tomada registrada no histórico',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao registrar dose não tomada',
            details: error.message,
        });
    }
}

export async function updateMedication(req, res) {
    const { userid, medicationId } = req.params;
    const {
        name,
        hournextdose,
        periodstart,
        periodend,
        intervalinhours,
        status,
    } = req.body;

    try {
        const medication = await models.Medication.findByPk(medicationId, {
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

        medication.name = name || medication.name;
        medication.hournextdose = hournextdose || medication.hournextdose;
        medication.status = status || medication.status;

        if (periodstart && !isNaN(new Date(periodstart).getTime())) {
            medication.periodstart = periodstart;
        }

        if (periodend && !isNaN(new Date(periodend).getTime())) {
            medication.periodend = periodend;
        }

        if (intervalinhours) {
            let doseInterval = await models.DoseIntervals.findOne({
                where: { intervalinhours: intervalinhours },
            });

            if (!doseInterval) {
                doseInterval = await models.DoseIntervals.create({
                    intervalinhours,
                });
            }

            medication.doseintervalid = doseInterval.id;

            const now = new Date();
            const createdat = new Date(medication.createdat);
            const isSameDay = now.toDateString() === createdat.toDateString();

            const lastDoseTime = new Date();
            const [lastDoseHours, lastDoseMinutes] = medication.hournextdose
                .split(':')
                .map(Number);
            lastDoseTime.setHours(lastDoseHours, lastDoseMinutes, 0, 0);

            if (isSameDay && now <= lastDoseTime) {
                medication.hournextdose = calculateNextDose(
                    medication.hourfirstdose,
                    intervalinhours,
                );
            } else {
                medication.hournextdose = calculateNextDose(
                    medication.hournextdose,
                    intervalinhours,
                );
            }
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

export async function updateMedicationStatus(req, res) {
    const { userId, medicationId } = req.params;
    const { status } = req.body;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userid !== userId) {
            return res
                .status(404)
                .json({ error: 'Medicamento não encontrado.' });
        }

        medication.status = status;
        await medication.save();

        if (status) {
            setTimeout(async () => {
                const updatedMedication = await models.Medication.findByPk(
                    medicationId,
                );

                if (updatedMedication && updatedMedication.status) {
                    await models.MedicationHistory.create({
                        medicationid: medicationId,
                        takendate: new Date(),
                        taken: true,
                    });

                    const [hours, mins] = updatedMedication.hournextdose
                        .split(':')
                        .map(Number);
                    const nextDose = new Date();
                    nextDose.setHours(
                        hours + updatedMedication.doseinterval.intervalinhours,
                        mins,
                    );

                    updatedMedication.hournextdose = `${String(
                        nextDose.getHours(),
                    ).padStart(2, '0')}:${String(
                        nextDose.getMinutes(),
                    ).padStart(2, '0')}`;
                    updatedMedication.status = false;
                    await updatedMedication.save();
                }
            }, 10 * 60 * 1000); // 10 minutos
        }

        res.status(200).json({
            message: `Status do medicamento ${medication.name} atualizado para ${status}`,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao atualizar o status do medicamento.',
            details: error.message,
        });
    }
}

export async function deleteMedication(req, res) {
    const { userid, medicationId } = req.params;

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userid !== userid) {
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
