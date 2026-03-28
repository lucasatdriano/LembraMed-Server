import cron from 'node-cron';
import { dateTime } from '../../utils/formatters/date-time.js';

import { MedicationRecoveryService } from '../medication/medication-recovery.service.js';
import { MedicationStatusService } from '../medication/medication-status.service.js';
import { MedicationExpirationService } from '../medication/medication-expiration.service.js';
import { MedicationMissedDoseService } from '../medication/medication-missed-dose.service.js';
import { MedicationPendingDoseService } from '../medication/medication-pending-dose.service.js';
import medicationNotificationScheduler from './medication-notification.scheduler.js';

import { logger } from '../../utils/logger.js';

class MedicationScheduler {
    constructor() {
        this.isInitialized = false;
        this.executionCount = 0;
        this.timeZone = 'America/Sao_Paulo';
    }

    init() {
        if (this.isInitialized) return;

        logger.info(
            { dateTime: this.timeZone },
            'Medication scheduler starting',
        );

        this.runInitialRecovery();

        this.startCron();

        this.isInitialized = true;

        logger.info('Medication scheduler initialized');
    }

    runInitialRecovery() {
        setTimeout(async () => {
            const now = dateTime.now();

            logger.info('Running initial missed dose recovery');

            await MedicationRecoveryService.recalculateMissedDoses(now);
        }, 5000);
    }

    startCron() {
        cron.schedule(
            '* * * * *',
            async () => {
                try {
                    this.executionCount++;

                    const now = dateTime.now();

                    logger.info(
                        {
                            execution: this.executionCount,
                            time: now.toISOString(),
                        },
                        'Medication scheduler tick',
                    );

                    await this.runCycle(now);
                } catch (error) {
                    logger.error(error, 'Scheduler cycle error');
                }
            },
            {
                timezone: this.timeZone,
            },
        );
    }

    async runCycle(now) {
        await MedicationStatusService.markExpiredAsInactive(now);

        await MedicationExpirationService.deleteExpiredMedications(now);

        await MedicationPendingDoseService.confirmExpiredPendingDoses(now);

        await MedicationMissedDoseService.detectMissedDoses(now);

        await medicationNotificationScheduler.checkMedicationNotifications();
    }
}

export default new MedicationScheduler();
