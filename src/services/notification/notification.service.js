import { PushService } from './push.service.js';
import { NotificationPayloadFactory } from '../../factories/notification.payload.factory.js';
import { NotificationRepository } from '../../repositories/notification.repository.js';

export class NotificationService {
    static async sendNotification(userId, title, message, tag) {
        const subscriptions =
            await PushSubscriptionRepository.findAllSubscriptions(userId);

        const payload = NotificationPayloadFactory.create({
            title,
            message,
            tag: tag || `notif-${userId}`,
            userId,
        });

        const results = await Promise.all(
            subscriptions.map((sub) => this.sendToDevice(sub, payload)),
        );

        const notification = await NotificationRepository.create({
            userid: userId,
            title,
            message: message ?? null,
        });

        const successful = results.filter((r) => r.success).length;

        return {
            success: true,
            notificationId: notification.id,
            message: `Notificação enviada para ${successful} dispositivos`,
        };
    }

    static async sendToDevice(sub, payload) {
        const subscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        };

        const result = await PushService.send(subscription, payload);

        if (result.success) {
            await sub.update({ lastused: new Date() });
        }

        if (result.expired) {
            await sub.destroy();
        }

        return result;
    }
}
