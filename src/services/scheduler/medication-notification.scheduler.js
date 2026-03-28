import { MedicationRepository } from '../../repositories/medication.repository.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { calculateDoseTolerance } from '../../utils/helpers/dose-rules.helper.js';
import { NotificationService } from '../notification/notification.service.js';
import { logger } from '../../utils/logger.js';

class MedicationNotificationScheduler {
    constructor() {
        this.sentInitialNotifications = new Set();
        this.reminderTimestamps = new Map();
        this.sentMissedNotifications = new Set();
        this.sentExpiredNotifications = new Map();
        this.reminderWindowEnded = new Set();
    }

    async checkMedicationNotifications() {
        try {
            const now = dateTime.now();

            logger.info('[NOTIFICATION_SCHEDULER] Checking medications');

            const medications =
                await MedicationRepository.findForNotification();

            for (const medication of medications) {
                await this.processMedication(medication, now);
            }

            await this.checkExpiredMedications();
        } catch (error) {
            logger.error(error, 'Error checking medication notifications');
        }
    }

    async processMedication(medication, now) {
        try {
            const doseDateTime = this.buildDoseDateTime(medication, now);

            const toleranceInMinutes = calculateDoseTolerance(
                medication.doseinterval.intervalinhours,
            );

            const diffInMinutes = this.calculateTimeDifferenceInMinutes(
                now,
                doseDateTime,
            );

            if (this.isInitialDose(diffInMinutes)) {
                return this.handleInitialNotification(medication, doseDateTime);
            }

            if (this.isReminderWindow(diffInMinutes, toleranceInMinutes)) {
                return this.handleReminderNotification(
                    medication,
                    now,
                    diffInMinutes,
                );
            }

            if (this.isMissedDose(diffInMinutes, toleranceInMinutes)) {
                return this.handleMissedNotification(medication, doseDateTime);
            }
        } catch (error) {
            logger.error(
                {
                    error,
                    medicationId: medication.id,
                },
                'Error processing medication',
            );
        }
    }

    buildDoseDateTime(medication, now) {
        const [hours, minutes] = medication.hournextdose.split(':').map(Number);

        const doseDate = new Date(now);
        doseDate.setHours(hours, minutes, 0, 0);

        return doseDate;
    }

    calculateTimeDifferenceInMinutes(current, target) {
        return (current.getTime() - target.getTime()) / (60 * 1000);
    }

    isInitialDose(diffInMinutes) {
        return diffInMinutes >= -1 && diffInMinutes <= 0;
    }

    isReminderWindow(diffInMinutes, toleranceInMinutes) {
        const reminderLimit = Math.min(30, toleranceInMinutes);

        return diffInMinutes > 0 && diffInMinutes <= reminderLimit;
    }

    isMissedDose(diffInMinutes, toleranceInMinutes) {
        return diffInMinutes > toleranceInMinutes;
    }

    generateDoseKey(medication, doseDateTime) {
        return `${medication.userid}-${medication.id}-${doseDateTime.toISOString()}`;
    }

    generateReminderKey(medication) {
        return `${medication.userid}-${medication.id}`;
    }

    generateExpiredKey(medication) {
        return `${medication.userid}-${medication.id}`;
    }

    async handleInitialNotification(medication, doseDateTime) {
        const key = this.generateDoseKey(medication, doseDateTime);

        if (this.sentInitialNotifications.has(key)) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'initial',
        );

        this.sentInitialNotifications.add(key);

        setTimeout(
            () => {
                this.sentInitialNotifications.delete(key);
            },
            24 * 60 * 60 * 1000,
        );
    }

    async handleReminderNotification(medication, now, diffInMinutes) {
        const key = this.generateReminderKey(medication);

        if (diffInMinutes > 30) {
            this.reminderWindowEnded.add(key);
            return;
        }

        if (this.reminderWindowEnded.has(key)) {
            return;
        }

        const lastSentAt = this.reminderTimestamps.get(key);
        const FIVE_MINUTES = 5 * 60 * 1000;

        const shouldSend =
            !lastSentAt || now.getTime() - lastSentAt >= FIVE_MINUTES;

        if (!shouldSend) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'reminder',
        );

        this.reminderTimestamps.set(key, now.getTime());

        if (diffInMinutes >= 30) {
            this.reminderWindowEnded.add(key);
        }
    }

    async handleMissedNotification(medication, doseDateTime) {
        const key = this.generateDoseKey(medication, doseDateTime);

        if (this.sentMissedNotifications.has(key)) return;

        await NotificationService.sendMedicationReminder(
            medication.userid,
            medication.id,
            medication.name,
            medication.hournextdose,
            'missed',
        );

        this.sentMissedNotifications.add(key);

        setTimeout(
            () => {
                this.sentMissedNotifications.delete(key);
            },
            24 * 60 * 60 * 1000,
        );

        const reminderKey = this.generateReminderKey(medication);
        this.reminderTimestamps.delete(reminderKey);
        this.reminderWindowEnded.delete(reminderKey);
    }

    async checkExpiredMedications() {
        try {
            const now = dateTime.now();

            const expiredMedications =
                await MedicationRepository.findExpiredForNotification(now);

            for (const medication of expiredMedications) {
                const key = this.generateExpiredKey(medication);
                const lastSent = this.sentExpiredNotifications.get(key);

                if (
                    lastSent &&
                    now.getTime() - lastSent < 24 * 60 * 60 * 1000
                ) {
                    continue;
                }

                await NotificationService.sendMedicationReminder(
                    medication.userid,
                    medication.id,
                    medication.name,
                    medication.hournextdose,
                    'expired',
                );

                this.sentExpiredNotifications.set(key, now.getTime());
            }
        } catch (error) {
            logger.error(error, 'Error checking expired medications');
        }
    }

    cleanup() {
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const expirationLimit = Date.now() - ONE_DAY;

        for (const [key, timestamp] of this.reminderTimestamps.entries()) {
            if (timestamp < expirationLimit) {
                this.reminderTimestamps.delete(key);
                this.reminderWindowEnded.delete(key);
            }
        }

        for (const [
            key,
            timestamp,
        ] of this.sentExpiredNotifications.entries()) {
            if (timestamp < expirationLimit) {
                this.sentExpiredNotifications.delete(key);
            }
        }
    }
}

export default new MedicationNotificationScheduler();
