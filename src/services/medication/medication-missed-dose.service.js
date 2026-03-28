import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { calculateDoseTolerance } from '../../utils/helpers/dose-rules.helper.js';
import { recalculateNextDoseTime } from '../../utils/helpers/recalculate-next-dose.helper.js';

export class MedicationMissedDoseService {
    static async detectMissedDoses(now, taken = false) {
        const medications = await MedicationRepository.findActive();

        for (const medication of medications) {
            const nextDose = MedicationRepository.getNextDoseDate(
                medication,
                now,
            );

            if (!nextDose) continue;

            const tolerance = calculateDoseTolerance(
                medication.doseinterval.intervalinhours,
            );

            const diffMinutes =
                (now.getTime() - nextDose.getTime()) / (60 * 1000);

            if (diffMinutes <= tolerance) continue;

            const existingRecord =
                await MedicationHistoryRepository.findByMedicationAndDoseTime(
                    medication.id,
                    nextDose,
                );

            if (existingRecord) {
                continue;
            }

            const [record, created] =
                await MedicationHistoryRepository.findOrCreate({
                    where: {
                        medicationid: medication.id,
                        takendate: nextDose,
                    },
                    defaults: {
                        medicationid: medication.id,
                        takendate: nextDose,
                        taken,
                    },
                });

            if (created) {
                await MedicationRepository.update(medication, {
                    hournextdose: recalculateNextDoseTime(
                        medication.hournextdose,
                        medication.doseinterval.intervalinhours,
                        now,
                    ),
                });
            }
        }
    }
}
