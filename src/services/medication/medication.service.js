import { Sequelize, Op } from 'sequelize';
import { AppError } from '../../utils/errors/app.error.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { recalculateNextDoseTime } from '../../utils/helpers/recalculate-next-dose.helper.js';
import { MedicationRepository } from '../../repositories/medication.repository.js';
import { DoseIntervalRepository } from '../../repositories/dose-intervals.repository.js';
import { sortMedicationsByPriority } from '../../utils/helpers/sort-medications.helper.js';

export class MedicationService {
    static async findMedications(userId, search, page, limit) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        const where = { userid: userId };

        if (search) {
            const orConditions = [
                { name: { [Op.like]: `%${search.toLowerCase()}%` } },
            ];

            if (!isNaN(Number(search))) {
                orConditions.push(
                    Sequelize.where(
                        Sequelize.col('doseinterval.intervalinhours'),
                        Number(search),
                    ),
                );
            }

            where[Op.or] = orConditions;
        }

        const { count, rows } = await MedicationRepository.findAndCountAll({
            where,
            include: [{ association: 'doseinterval' }],
            limit: limitNumber,
            offset,
        });

        const sortedMedications = sortMedicationsByPriority(rows);

        return {
            medications: sortedMedications,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(count / limitNumber),
                totalRecords: count,
            },
        };
    }

    static async getMedicationById(userId, medicationId) {
        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
            include: ['doseinterval', 'history'],
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        return medication;
    }

    static async createMedication(userId, data) {
        const { name, hourfirstdose, periodstart, periodend, intervalinhours } =
            data;

        const doseInterval =
            await DoseIntervalRepository.findOrCreate(intervalinhours);

        if (!doseInterval) {
            throw new AppError('Intervalo de dosagem inválido', 400);
        }

        return MedicationRepository.create({
            name: name.toLowerCase().trim(),
            hourfirstdose,
            periodstart: dateTime.startOfDay(periodstart),
            periodend: dateTime.endOfDay(periodend),
            userid: userId,
            doseintervalid: doseInterval.id,
            hournextdose: hourfirstdose,
        });
    }

    static async updateMedication(userId, medicationId, data) {
        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
            include: [
                {
                    association: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        const updates = await this.buildMedicationUpdates(medication, data);

        await MedicationRepository.update(medication, updates);

        const updatedMedication = await MedicationRepository.findByPk(
            medicationId,
            {
                include: [
                    {
                        association: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        return updatedMedication;
    }

    static async deleteMedication(userId, medicationId) {
        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        const medicationName = medication.name;

        await MedicationRepository.delete(medication);

        return { medicationName };
    }

    static async buildMedicationUpdates(medication, data) {
        const { name, hournextdose, periodstart, periodend, intervalinhours } =
            data;

        const updates = {};

        if (name) {
            updates.name = name.toLowerCase().trim();
        }

        if (periodstart) {
            updates.periodstart = dateTime.startOfDay(periodstart);
        }

        if (periodend) {
            updates.periodend = dateTime.endOfDay(periodend);
        }

        if (hournextdose) {
            updates.hournextdose = hournextdose;
        }

        if (
            intervalinhours &&
            intervalinhours !== medication.doseinterval?.intervalinhours
        ) {
            await this.applyIntervalUpdate(
                medication,
                intervalinhours,
                updates,
                hournextdose,
            );
        }

        return updates;
    }

    static async applyIntervalUpdate(
        medication,
        intervalinhours,
        updates,
        hournextdose,
    ) {
        let doseInterval =
            await DoseIntervalRepository.findOrCreate(intervalinhours);

        if (!doseInterval) {
            throw new AppError('Erro ao processar intervalo de dosagem', 500);
        }

        updates.doseintervalid = doseInterval.id;

        if (!hournextdose && medication.hournextdose) {
            updates.hournextdose = recalculateNextDoseTime(
                medication.hournextdose,
                intervalinhours,
            );
        }
    }
}
