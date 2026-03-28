import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class MedicationHistoryRepository {
    static findAndCountAll(options) {
        return models.MedicationHistory.findAndCountAll(options);
    }

    static findLast(medicationId) {
        return models.MedicationHistory.findOne({
            where: { medicationid: medicationId },
            order: [['takendate', 'DESC']],
        });
    }

    static findRecentByMedication(medicationId, minutes = 5) {
        const now = new Date();
        const threshold = new Date(now.getTime() - minutes * 60 * 1000);

        return models.MedicationHistory.findOne({
            where: {
                medicationid: medicationId,
                takendate: {
                    [Op.gte]: threshold,
                },
            },
        });
    }

    static async findByMedicationAndDoseTime(medicationId, doseDate) {
        const startOfMinute = new Date(doseDate);
        startOfMinute.setSeconds(0, 0);

        const endOfMinute = new Date(doseDate);
        endOfMinute.setSeconds(59, 999);

        return models.MedicationHistory.findOne({
            where: {
                medicationid: medicationId,
                takendate: {
                    [Op.between]: [startOfMinute, endOfMinute],
                },
            },
        });
    }

    static async findOrCreate(options) {
        return models.MedicationHistory.findOrCreate(options);
    }

    static create(data) {
        return models.MedicationHistory.create(data);
    }

    static createMissed(medicationId, date) {
        return models.MedicationHistory.create({
            medicationid: medicationId,
            takendate: date,
            taken: false,
        });
    }
}
