import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { MedicationRepository } from '../../repositories/medication.repository.js';
import { calculateDoseTolerance } from '../../utils/helpers/dose-rules.helper.js';
import { calculateNextSchedule } from '../../utils/helpers/medication-time.helper.js';
import { logger } from '../../utils/logger.js';

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

            let next =
                new Date(lastHistory.scheduleddate).getTime() + intervalMs;
            let createdCount = 0;

            const tolerance = calculateDoseTolerance(
                medication.doseinterval.intervalinhours,
            );

            const toleranceMs = tolerance * 60 * 1000;

            while (next + toleranceMs < now.getTime()) {
                const nextDate = new Date(next);

                const existingRecord =
                    await MedicationHistoryRepository.findByMedicationAndDoseTime(
                        medication.id,
                        nextDate,
                    );

                if (!existingRecord) {
                    await MedicationHistoryRepository.createMissed(
                        medication.id,
                        nextDate,
                    );
                    createdCount++;
                }

                next += intervalMs;
            }

            if (createdCount > 0) {
                const nextDoseTime = calculateNextSchedule(
                    medication.hournextdose,
                    medication.doseinterval.intervalinhours,
                    now,
                );

                await MedicationRepository.update(medication, {
                    hournextdose: nextDoseTime,
                    pendingconfirmation: false,
                    pendinguntil: null,
                });

                logger.info(
                    {
                        medicationId: medication.id,
                        missedDosesCreated: createdCount,
                        nextDose: nextDoseTime,
                    },
                    'Recovered missed doses',
                );
            }
        }
    }
}
