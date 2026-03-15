import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';

export class MedicationRecoveryService {
    static async recalculateMissedDoses(agora) {
        const medications = await MedicationRepository.findActive();

        for (const med of medications) {
            const lastHistory = await MedicationHistoryRepository.findLast(
                med.id,
            );

            if (!lastHistory) continue;

            const lastDate = new Date(lastHistory.takendate);

            const interval = med.doseinterval.intervalinhours * 60 * 60 * 1000;

            let next = new Date(lastDate.getTime() + interval);

            while (next < agora) {
                await MedicationHistoryRepository.createMissed(med.id, next);

                next = new Date(next.getTime() + interval);
            }
        }
    }
}
