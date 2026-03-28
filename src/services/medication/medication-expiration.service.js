import { MedicationRepository } from '../../repositories/medication.repository.js';
import { logger } from '../../utils/logger.js';

export class MedicationExpirationService {
    static async deleteExpiredMedications(now) {
        const expired = await MedicationRepository.findExpired(now);

        if (!expired.length) return;

        for (const medication of expired) {
            await MedicationRepository.deleteById(medication.id);

            logger.info(
                { medicationId: medication.id },
                'Expired medication deleted',
            );
        }
    }
}
