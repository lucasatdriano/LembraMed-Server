import cron from 'node-cron';
import { timezone } from '../../utils/formatters/timezone.js';

import { MedicationMissedDoseService } from '../medication/medication-missed-dose.service.js';
import { MedicationPendingDoseService } from '../medication/medication-pending-dose.service.js';
import { MedicationExpirationService } from '../medication/medication-expiration.service.js';
import { MedicationRecoveryService } from '../medication/medication-recovery.service.js';
import medicationNotificationScheduler from './medication-notification.scheduler.js';

import { logger } from '../../utils/logger.js';

class MedicationScheduler {
    constructor() {
        this.initialized = false;
        this.executionCount = 0;
        this.timeZone = 'America/Sao_Paulo';
    }

    init() {
        if (this.initialized) return;

        logger.info(
            { timezone: this.timeZone },
            'Medication scheduler starting',
        );

        setTimeout(async () => {
            const agora = timezone.now();

            logger.info('Running initial missed dose recovery');

            await MedicationRecoveryService.recalculateMissedDoses(agora);
        }, 5000);

        cron.schedule(
            '* * * * *',
            async () => {
                try {
                    this.executionCount++;

                    const agora = timezone.now();

                    logger.info(
                        {
                            execution: this.executionCount,
                            time: agora.toISOString(),
                        },
                        'Medication scheduler tick',
                    );

                    await this.runCycle(agora);
                } catch (error) {
                    logger.error(error, 'Scheduler cycle error');
                }
            },
            {
                timezone: this.timeZone,
            },
        );

        this.initialized = true;

        logger.info('Medication scheduler initialized');
    }

    async runCycle(agora) {
        await MedicationExpirationService.deleteExpiredMedications(agora);

        await MedicationPendingDoseService.confirmExpiredPendingDoses(agora);

        await MedicationMissedDoseService.detectMissedDoses(agora);

        await medicationNotificationScheduler.checkMedicationNotifications();
    }
}

export default new MedicationScheduler();
