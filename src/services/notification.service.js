import webpush from 'web-push';
import { models } from '../models/index.js';
import { timezone } from '../utils/formatters/timezone.js';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

export class NotificationService {
    static async sendNotification(userId, title, message, tag) {
        const subscriptions = await models.PushSubscription.findAll({
            where: { userid: userId },
        });

        if (subscriptions.length === 0) {
            throw new Error(
                'Nenhuma subscription encontrada para este usuário',
            );
        }

        const payload = JSON.stringify({
            title,
            body: message || '',
            userid: userId,
            tag: tag || `notif-${userId}`,
            timestamp: timezone.now().toISOString(),
        });

        const sendPromises = subscriptions.map(async (sub) => {
            const subscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                await webpush.sendNotification(subscription, payload);

                await sub.update({ lastused: timezone.now() });

                return { success: true, subscriptionId: sub.id };
            } catch (error) {
                console.error(
                    `Erro ao enviar para subscription ${sub.id}:`,
                    error,
                );

                if (error.statusCode === 410) {
                    await sub.destroy();
                }

                return {
                    success: false,
                    subscriptionId: sub.id,
                    error: error.message,
                };
            }
        });

        const results = await Promise.all(sendPromises);

        await models.Notification.create({
            userid: userId,
            title,
            message: message || null,
        });

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return {
            success: true,
            message: `Notificação enviada para ${successful} dispositivos`,
            details: {
                total: subscriptions.length,
                successful,
                failed,
            },
        };
    }

    static async getNotifications(userId, limit, offset) {
        const notifications = await models.Notification.findAll({
            where: { userid: userId },
            attributes: ['id', 'title', 'message', 'sentat', 'readat'],
            order: [['sentat', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return notifications;
    }

    static async markAsRead(userId, notificationId) {
        const notification = await models.Notification.findOne({
            where: {
                id: notificationId,
                userid: userId,
            },
        });

        if (!notification) {
            return null;
        }

        await notification.update({ readat: timezone.now() });

        return notification;
    }
}
