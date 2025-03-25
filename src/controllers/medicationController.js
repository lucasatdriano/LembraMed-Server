import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { calculateNextDose } from '../utils/calculateNextDose.js';

export async function getMedications(req, res) {
    const { userid } = req.params;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

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

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

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

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

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

export async function updateMedication(req, res) {
    const { userid, medicationId } = req.params;
    const { name, hournextdose, periodstart, periodend, intervalinhours } =
        req.body;

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
    const { userid, medicationId } = req.params;
    const { status } = req.body;

    if (typeof status !== 'boolean') {
        return res
            .status(400)
            .json({ error: 'Status inválido. Deve ser booleano.' });
    }

    try {
        const medication = await models.Medication.findByPk(medicationId);

        if (!medication || medication.userid !== userid) {
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
                        medicationid: updatedMedication.id,
                        takendate: new Date(),
                    });

                    updatedMedication.status = false;
                    await updatedMedication.save();
                    console.log(
                        `Histórico criado e status resetado para o medicamento ${updatedMedication.name}`,
                    );
                } else {
                    console.log(
                        'Status revertido antes do tempo. Histórico não criado.',
                    );
                }
            }, 29 * 60 * 1000); // 29 minutos
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
