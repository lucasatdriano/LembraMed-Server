import { PushSubscriptionRepository } from '../../repositories/push-subscription.repository.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { logger } from '../../utils/logger.js';

export class SubscriptionService {
    static async saveSubscription(userId, subscription) {
        try {
            if (!subscription?.endpoint) {
                throw new Error('endpoint é obrigatório');
            }

            if (!subscription?.keys?.p256dh || !subscription?.keys?.auth) {
                throw new Error('keys incompletas');
            }

            const data = {
                userid: userId,
                deviceid: subscription.deviceId || null,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                lastused: dateTime.now(),
            };

            await PushSubscriptionRepository.upsertPushSubscription(data);

            return { success: true };
        } catch (error) {
            logger.error(
                {
                    message: error.message,
                    stack: error.stack,
                },
                'Erro em salvar subscription',
            );
            throw error;
        }
    }

    static async removeSubscription(userId, deviceId) {
        return PushSubscriptionRepository.deleteSubscription(userId, deviceId);
    }
}
