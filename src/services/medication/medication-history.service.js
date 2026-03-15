import { Op } from 'sequelize';
import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { timezone } from '../../utils/formatters/timezone.js';
import { AppError } from '../../utils/errors/app.error.js';

export class MedicationHistoryService {
    static async getMedicationHistory(userId, medicationId, filters) {
        const { startDate, endDate, status, page, limit } = filters;

        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        const where = { medicationid: medicationId };

        if (startDate || endDate) {
            where.takendate = {};

            if (startDate) where.takendate[Op.gte] = timezone.now(startDate);

            if (endDate) where.takendate[Op.lte] = timezone.now(endDate);
        }

        if (status && status !== 'all') {
            where.taken = status === 'taken';
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
