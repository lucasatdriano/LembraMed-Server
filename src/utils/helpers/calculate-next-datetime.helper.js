import { models } from '../../models/index.js';
import { calculateNextFullDateTime } from './next-dose-datetime.helper.js';

export async function calculateNextDateTime(medicationJson) {
    try {
        if (!medicationJson.dataValues) {
            const medication = await models.Medication.findByPk(
                medicationJson.id,
                {
                    include: [
                        {
                            model: models.DoseIntervals,
                            as: 'doseinterval',
                        },
                    ],
                },
            );

            if (!medication) return null;

            const nextFullDate = calculateNextFullDateTime(medication);
            return nextFullDate ? nextFullDate.toISOString() : null;
        }

        const nextFullDate = calculateNextFullDateTime(medicationJson);
        return nextFullDate ? nextFullDate.toISOString() : null;
    } catch (error) {
        console.error('[calculateNextDateTime] Erro:', error);
        return null;
    }
}
