import { MedicationRepository } from '../../repositories/medication.repository.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { calculateDoseTolerance } from '../../utils/helpers/dose-rules.helper.js';
import { calculateNextSchedule } from '../../utils/helpers/medication-time.helper.js';

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

            if (!existingRecord) {
                await MedicationHistoryRepository.findOrCreate({
                    where: {
                        medicationid: medication.id,
                        scheduleddate: nextDose,
                    },
                    defaults: {
                        medicationid: medication.id,
                        takendate: null,
                        scheduleddate: nextDose,
                        taken,
                    },
                });
            }

            const nextDoseTime = calculateNextSchedule(
                medication.hournextdose,
                medication.doseinterval.intervalinhours,
                now,
            );

            if (
                nextDoseTime.getTime() !==
                new Date(medication.hournextdose).getTime()
            ) {
                await MedicationRepository.update(medication, {
                    hournextdose: nextDoseTime,
                });
            }
        }
    }
}
