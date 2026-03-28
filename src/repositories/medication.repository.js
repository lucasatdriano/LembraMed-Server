import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class MedicationRepository {
    static findAll(options) {
        return models.Medication.findAll(options);
    }

    static findAndCountAll(options) {
        return models.Medication.findAndCountAll(options);
    }

    static findOne(options) {
        return models.Medication.findOne(options);
    }

    static findByPk(id, options = {}) {
        return models.Medication.findByPk(id, options);
    }

    static findActive() {
        return models.Medication.findAll({
            where: {
                status: true,
                pendingconfirmation: false,
                hournextdose: { [Op.ne]: null },
            },
            include: ['doseinterval'],
        });
    }

    static findForNotification() {
        return models.Medication.findAll({
            where: {
                status: true,
                pendingconfirmation: false,
            },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });
    }

    static findExpired(now) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const deleteAfter = new Date(startOfDay);
        deleteAfter.setDate(deleteAfter.getDate() - 1);

        return models.Medication.findAll({
            where: {
                periodend: {
                    [Op.ne]: null,
                    [Op.lt]: deleteAfter,
                },
            },
        });
    }

    static findExpiredForNotification(now) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        return models.Medication.findAll({
            where: {
                periodend: {
                    [Op.ne]: null,
                    [Op.lt]: startOfDay,
                },
            },
        });
    }

    static findExpiredPending(now) {
        return models.Medication.findAll({
            where: {
                pendingconfirmation: true,
                pendinguntil: {
                    [Op.lte]: now,
                },
            },
            include: ['doseinterval'],
        });
    }

    static getNextDoseDate(medication, now) {
        if (!medication.hournextdose) return null;

        const [hours, minutes] = medication.hournextdose.split(':').map(Number);

        const doseDate = new Date(now);
        doseDate.setHours(hours, minutes, 0, 0);

        return doseDate;
    }

    static create(data) {
        return models.Medication.create(data);
    }

    static update(instance, data) {
        return instance.update(data);
    }

    static delete(instance) {
        return instance.destroy();
    }

    static deleteById(id) {
        return models.Medication.destroy({
            where: { id },
        });
    }
}
