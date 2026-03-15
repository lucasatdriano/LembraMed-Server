import { MedicationRepository } from '../../repositories/medication.repository.js';
import { timezone } from '../../utils/formatters/timezone.js';
import { calcularTolerancia } from '../../utils/helpers/dose-rules.helper.js';
import { NotificationService } from '../notification/notification.service.js';
import { logger } from '../../utils/logger.js';

class MedicationNotificationScheduler {
    constructor() {
        this.initialTracker = new Set();
        this.reminderTracker = new Map();
        this.missedTracker = new Set();
    }

    async checkMedicationNotifications() {
        try {
            const agora = timezone.now();

            logger.info('[NOTIFICATION_SCHEDULER] Checking medications');

            const medications =
                await MedicationRepository.findAllForNotification();

            for (const medication of medications) {
                await this.processMedication(medication, agora);
            }
        } catch (error) {
            logger.error(error, 'Error checking medication notifications');
        }
    }

    async processMedication(medication, agora) {
        try {
            const doseTime = this.getDoseTime(medication, agora);

            const toleranciaMinutos = calcularTolerancia(
                medication.doseinterval.intervalinhours,
            );

            const diffMinutos =
                (agora.getTime() - doseTime.getTime()) / (60 * 1000);

            if (this.isInitialDose(diffMinutos)) {
                await this.handleInitial(medication, doseTime);
                return;
            }

            if (this.isReminder(diffMinutos, toleranciaMinutos)) {
                await this.handleReminder(medication, agora);
                return;
            }

            if (this.isMissed(diffMinutos, toleranciaMinutos)) {
                await this.handleMissed(medication, doseTime);
                return;
            }
        } catch (error) {
            logger.error(
                { medicationId: medication.id },
                'Error processing medication',
            );
        }
    }

    getDoseTime(medication, agora) {
        const [horas, minutos] = medication.hournextdose.split(':').map(Number);

        const dose = new Date(agora);
        dose.setHours(horas, minutos, 0, 0);

        return dose;
    }

    isInitialDose(diffMinutos) {
        return Math.abs(diffMinutos) < 1;
    }

    isReminder(diffMinutos, tolerancia) {
        return diffMinutos > 0 && diffMinutos <= tolerancia;
    }

    isMissed(diffMinutos, tolerancia) {
        return diffMinutos > tolerancia;
    }

    async handleInitial(medication, doseTime) {
        const key = `${medication.userid}-${medication.id}-${doseTime.toISOString()}`;

        if (this.initialTracker.has(key)) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'initial',
        );

        this.initialTracker.add(key);
    }

    async handleReminder(medication, agora) {
        const key = `${medication.userid}-${medication.id}`;
        const lastReminder = this.reminderTracker.get(key);

        const shouldSend =
            !lastReminder || agora.getTime() - lastReminder >= 5 * 60 * 1000;

        if (!shouldSend) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'reminder',
        );

        this.reminderTracker.set(key, agora.getTime());
    }

    async handleMissed(medication, doseTime) {
        const key = `${medication.userid}-${medication.id}-${doseTime.toISOString()}`;

        if (this.missedTracker.has(key)) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'missed',
        );

        this.missedTracker.add(key);
    }

    async checkExpiredMedications() {
        try {
            const agora = timezone.now();

            const expired =
                await MedicationRepository.findExpiredMedications(agora);

            for (const med of expired) {
                await NotificationService.sendNotification(
                    med.userid,
                    'Medicamento Expirado',
                    `O período de uso de ${med.name} terminou.`,
                    `med-expired-${med.id}`,
                );

                await MedicationRepository.deleteById(med.id);
            }

            logger.info(
                { count: expired.length },
                'Expired medications processed',
            );
        } catch (error) {
            logger.error(error, 'Error checking expired medications');
        }
    }

    cleanup() {
        const limit = Date.now() - 24 * 60 * 60 * 1000;

        for (const [key, timestamp] of this.reminderTracker.entries()) {
            if (timestamp < limit) {
                this.reminderTracker.delete(key);
            }
        }
    }
}

export default new MedicationNotificationScheduler();
