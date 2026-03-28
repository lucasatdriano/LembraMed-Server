import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { MedicationRepository } from '../../repositories/medication.repository.js';

export class MedicationRecoveryService {
    static async recalculateMissedDoses(now) {
        const medications = await MedicationRepository.findActive();

        for (const medication of medications) {
            const lastHistory = await MedicationHistoryRepository.findLast(
                medication.id,
            );

            if (!lastHistory) continue;

            const intervalMs =
                medication.doseinterval.intervalinhours * 60 * 60 * 1000;

            if (intervalMs <= 0) continue;

            let next = new Date(lastHistory.takendate).getTime() + intervalMs;

            let safety = 0;

            while (next < now.getTime() && safety < 1000) {
                await MedicationHistoryRepository.createMissed(
                    medication.id,
                    new Date(next),
                );

                next += intervalMs;
                safety++;
            }
        }
    }
}
