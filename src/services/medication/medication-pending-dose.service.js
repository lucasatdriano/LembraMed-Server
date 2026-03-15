import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationDoseService } from './medication-dose.service.js';

export class MedicationPendingDoseService {
    static async confirmExpiredPendingDoses(agora) {
        const pending = await MedicationRepository.findExpiredPending(agora);

        for (const medication of pending) {
            await MedicationDoseService.confirmDose(medication, true);
        }
    }
}
