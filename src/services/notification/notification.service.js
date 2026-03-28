import { dateTime } from '../../utils/formatters/date-time.js';
import { NotificationPayloadFactory } from '../../factories/notification.payload.factory.js';
import { NotificationRepository } from '../../repositories/notification.repository.js';
import { PushSubscriptionRepository } from '../../repositories/push-subscription.repository.js';
import { PushService } from './push.service.js';
import { ReminderService } from './reminder.service.js';

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

    static async getNotifications(userId, limit, offset) {
        return NotificationRepository.findByUser(
            userId,
            parseInt(limit),
            parseInt(offset),
        );
    }

    static async markAsRead(userId, notificationId) {
        const notification = await NotificationRepository.findOne(
            userId,
            notificationId,
        );

        if (!notification) return null;

        await notification.update({
            readat: dateTime.now(),
        });

        return notification;
    }

    static getVapidPublicKey() {
        return process.env.VAPID_PUBLIC_KEY;
    }

    static async sendMedicationReminder(
        userId,
        medicationId,
        medicationName,
        doseTime,
        reminderType,
    ) {
        const { title, message, tag } = ReminderService.buildReminder(
            reminderType,
            medicationName,
            doseTime,
            medicationId,
        );

        const subscriptions =
            await PushSubscriptionRepository.findAllSubscriptions(userId);

        const payload = NotificationPayloadFactory.create({
            title,
            message,
            tag,
            userId,
            data: {
                medicationId,
                medicationName,
                doseTime,
                reminderType,
            },
        });

        const results = await Promise.all(
            subscriptions.map((sub) => this.sendToDevice(sub, payload)),
        );

        const notification = await NotificationRepository.create({
            userid: userId,
            title,
            message,
        });

        const successful = results.filter((r) => r.success).length;

        return {
            success: successful > 0,
            notificationId: notification.id,
            details: {
                total: subscriptions.length,
                successful,
            },
        };
    }
}
