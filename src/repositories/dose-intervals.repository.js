import { models } from '../models/index.js';

export class DoseIntervalRepository {
    static findByInterval(intervalinhours) {
        return models.DoseIntervals.findOne({
            where: { intervalinhours },
        });
    }

    static async findOrCreate(intervalinhours) {
        const hours = parseInt(intervalinhours);

        let doseInterval = await this.findByInterval(hours);

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalinhours: hours,
            });
        }

        return doseInterval;
    }

    static create(intervalinhours) {
        return models.DoseIntervals.create({
            intervalinhours,
        });
    }
}
