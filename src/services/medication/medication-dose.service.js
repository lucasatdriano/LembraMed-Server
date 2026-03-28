import { MedicationRepository } from '../../repositories/medication.repository.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { calculateDoseTolerance } from '../../utils/helpers/dose-rules.helper.js';
import { AppError } from '../../utils/errors/app.error.js';
import { logger } from '../../utils/logger.js';
import { MedicationHistoryRepository } from '../../repositories/medication-history.repository.js';
import { recalculateNextDoseTime } from '../../utils/helpers/recalculate-next-dose.helper.js';

export class MedicationDoseService {
    static async confirmDose(medication, taken = true) {
        if (!medication.status) {
            throw new AppError(
                'Este medicamento já foi finalizado e está disponível apenas para consulta.',
                400,
            );
        }

        const now = dateTime.now();

        try {
            const nextDoseDate = MedicationRepository.getNextDoseDate(
                medication,
                now,
            );

            const recent =
                await MedicationHistoryRepository.findRecentByMedication(
                    medication.id,
                    5,
                );

            if (recent) {
                logger.warn(
                    { medicationId: medication.id },
                    'Recent history already exists, skipping duplicate',
                );
                return;
            }

            await MedicationHistoryRepository.create({
                medicationid: medication.id,
                takendate: nextDoseDate,
                taken,
            });

            const takenTime = dateTime.toTimeString(now);

            const nextDoseTime = recalculateNextDoseTime(
                medication.hournextdose,
                medication.doseinterval.intervalinhours,
                now,
            );

            await MedicationRepository.update(medication, {
                pendingconfirmation: false,
                pendinguntil: null,
                lasttakentime: taken ? takenTime : null,
                hournextdose: nextDoseTime,
            });

            logger.info(
                { medicationId: medication.id },
                'CONFIRM_DOSE success',
            );
        } catch (error) {
            logger.error(
                { error, medicationId: medication.id },
                'CONFIRM_DOSE error',
            );
            throw error;
        }
    }

    static async registerPendingConfirmation(userId, medicationId) {
        const now = dateTime.now();

        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
            include: [{ association: 'doseinterval' }],
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        if (!medication.status) {
            throw new AppError(
                'Este medicamento já foi finalizado e está disponível apenas para consulta.',
                400,
            );
        }

        const intervalInHours = medication.doseinterval.intervalinhours;

        const today = dateTime.timeStringToDate(medication.hournextdose, now);

        const currentDose = now.getTime() < today.getTime() ? today : today;

        const diffHours =
            (currentDose.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffHours > 2) {
            throw new AppError(
                'Você só pode marcar a dose até 2 horas antes.',
                400,
            );
        }

        const toleranceInMinutes = calculateDoseTolerance(intervalInHours);

        const diffMinutes =
            (now.getTime() - currentDose.getTime()) / (60 * 1000);

        if (diffMinutes > toleranceInMinutes) {
            throw new AppError('Esta dose já está perdida', 400);
        }

        const lastDose = await MedicationHistoryRepository.findLast(
            medication.id,
        );

        if (lastDose) {
            const intervalMs = intervalInHours * 60 * 60 * 1000;

            const nextAllowed =
                new Date(lastDose.takendate).getTime() + intervalMs;

            const toleranceBeforeMs = 2 * 60 * 60 * 1000; // 👈 AQUI

            if (now.getTime() < nextAllowed - toleranceBeforeMs) {
                const diffMs = nextAllowed - toleranceBeforeMs - now.getTime();

                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                );

                throw new AppError(
                    `Você poderá marcar em ${hours}h ${minutes}min.`,
                    400,
                );
            }
        }

        const base =
            now.getTime() < currentDose.getTime()
                ? currentDose.getTime()
                : now.getTime();

        const pendingUntil = base + 3 * 60 * 1000;

        await MedicationRepository.update(medication, {
            pendingconfirmation: true,
            pendinguntil: pendingUntil,
        });

        const formatted = new Date(pendingUntil).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return {
            message: `Dose registrada até ${formatted}`,
            pendingUntil,
            pendingUntilFormatted: formatted,
            expiresIn: '3 minutos',
        };
    }

    static async cancelPendingDose(userId, medicationId) {
        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        await MedicationRepository.update(medication, {
            pendingconfirmation: false,
            pendinguntil: null,
        });

        return { message: 'Confirmação cancelada' };
    }
}
