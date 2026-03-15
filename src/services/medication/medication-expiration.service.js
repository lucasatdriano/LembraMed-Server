import { MedicationRepository } from '../../repositories/medication.repository.js';
import { logger } from '../../utils/logger.js';

export class MedicationExpirationService {
    static async deleteExpiredMedications(agora) {
        const expired = await MedicationRepository.findExpired(agora);

        if (!expired.length) return;

        for (const med of expired) {
            await MedicationRepository.delete(med.id);

            logger.info({ medicationId: med.id }, 'Expired medication deleted');
        }
    }
}
