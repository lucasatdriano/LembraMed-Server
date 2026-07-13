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

    static getNextDoseDate(medication) {
        if (!medication.hournextdose) return null;

        const doseDate =
            typeof medication.hournextdose === 'string'
                ? new Date(medication.hournextdose)
                : medication.hournextdose;

        return doseDate;
    }

    static extractTimeFromTimestamp(timestamp) {
        if (!timestamp) return null;

        const date =
            typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    static create(data) {
        return models.Medication.create(data);
    }

    static update(instance, data) {
        if (data.hournextdose instanceof Date) {
            data.hournextdose = data.hournextdose.toISOString();
        }
        if (data.hourfirstdose instanceof Date) {
            data.hourfirstdose = data.hourfirstdose.toISOString();
        }
        if (data.pendinguntil instanceof Date) {
            data.pendinguntil = data.pendinguntil.toISOString();
        }
        if (data.updatedat instanceof Date) {
            data.updatedat = data.updatedat.toISOString();
        }
        if (data.lasttakentime instanceof Date) {
            data.lasttakentime = data.lasttakentime.toISOString();
        }
        if (data.periodstart instanceof Date) {
            data.periodstart = data.periodstart.toISOString();
        }
        if (data.periodend instanceof Date) {
            data.periodend = data.periodend.toISOString();
        }

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
