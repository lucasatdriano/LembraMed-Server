import { Op } from 'sequelize';
import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { AppError } from '../../utils/errors/app.error.js';

export class MedicationHistoryService {
    static async getMedicationHistory(userId, medicationId, filters) {
        const { startDate, endDate, doseStatus, page, limit } = filters;

        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        const where = { medicationid: medicationId };

        if (startDate || endDate) {
            where.takendate = {};

            if (startDate) where.takendate[Op.gte] = dateTime.now(startDate);

            if (endDate) where.takendate[Op.lte] = dateTime.now(endDate);
        }

        if (doseStatus && doseStatus !== 'all') {
            where.taken = doseStatus === 'taken';
        }

        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 20;

        const { count, rows } =
            await MedicationHistoryRepository.findAndCountAll({
                where,
                order: [['takendate', 'DESC']],
                limit: limitNumber,
                offset: (pageNumber - 1) * limitNumber,
            });

        return {
            history: rows,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(count / limitNumber),
                totalRecords: count,
            },
        };
    }
}
