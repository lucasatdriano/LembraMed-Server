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

    static createMissed(medicationId, date) {
        return models.MedicationHistory.create({
            medicationid: medicationId,
            takendate: date,
            taken: false,
        });
    }
}
