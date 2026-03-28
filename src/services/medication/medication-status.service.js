import { Op } from 'sequelize';
import { MedicationRepository } from '../../repositories/medication.repository.js';

export class MedicationStatusService {
    static async markExpiredAsInactive(now) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const medications = await MedicationRepository.findAll({
            where: {
                periodend: {
                    [Op.ne]: null,
                    [Op.lt]: startOfDay,
                },
                status: true,
            },
        });

        for (const med of medications) {
            await MedicationRepository.update(med, {
                hournextdose: null,
                status: false,
                pendingconfirmation: false,
                pendinguntil: null,
            });
        }
    }
}
