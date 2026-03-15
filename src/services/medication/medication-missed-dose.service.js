import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { calcularTolerancia } from '../../utils/helpers/dose-rules.helper.js';

export class MedicationMissedDoseService {
    static async detectMissedDoses(agora) {
        const medications = await MedicationRepository.findActive();

        for (const med of medications) {
            const nextDose = MedicationRepository.getNextDoseDate(med, agora);

            const tolerancia = calcularTolerancia(
                med.doseinterval.intervalinhours,
            );

            const diffMinutos =
                (agora.getTime() - nextDose.getTime()) / (60 * 1000);

            if (diffMinutos > tolerancia) {
                await MedicationHistoryRepository.createMissed(med.id, agora);
            }
        }
    }
}
