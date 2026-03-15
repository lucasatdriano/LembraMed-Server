import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class MedicationRepository {
    static findAndCountAll(options) {
        return models.Medication.findAndCountAll(options);
    }

    static findOne(options) {
        return models.Medication.findOne(options);
    }

    static findByPk(id, options = {}) {
        return models.Medication.findByPk(id, options);
    }

    static findExpired(agora) {
        const startOfDay = new Date(agora);
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

    static findExpiredPending(agora) {
        return models.Medication.findAll({
            where: {
                pendingconfirmation: true,
                pendinguntil: {
                    [Op.lte]: agora,
                },
            },
            include: ['doseinterval'],
        });
    }

    static findActive() {
        return models.Medication.findAll({
            where: {
                pendingconfirmation: false,
                hournextdose: { [Op.ne]: null },
            },
            include: ['doseinterval'],
        });
    }

    static findAllForNotification() {
        return models.Medication.findAll({
            where: {
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

    static findExpiredMedications(agora) {
        const startOfDay = new Date(agora);
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

    static getNextDoseDate(medication, agora) {
        const [hora, minuto] = medication.hournextdose.split(':').map(Number);

        const dose = new Date(agora);

        dose.setHours(hora, minuto, 0, 0);

        return dose;
    }

    static create(data) {
        return models.Medication.create(data);
    }

    static async update(instance, data) {
        return instance.update(data);
    }

    static async delete(instance) {
        return instance.destroy();
    }

    static deleteById(id) {
        return models.Medication.destroy({
            where: { id },
        });
    }
}
