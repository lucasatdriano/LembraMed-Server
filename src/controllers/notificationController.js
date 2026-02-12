import webpush from 'web-push';
import { models } from '../models/index.js';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

export async function sendNotification(req, res) {
    try {
        const { title, message, tag } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({
                error: 'Title é obrigatório',
            });
        }

        const subscriptions = await models.PushSubscription.findAll({
            where: { userid: userId },
        });

        if (subscriptions.length === 0) {
            return res.status(404).json({
                error: 'Nenhuma subscription encontrada para este usuário',
            });
        }

        const payload = JSON.stringify({
            title,
            body: message || '',
            userid: userId,
            tag: tag || `notif-${userId}`,
            timestamp: new Date().toISOString(),
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

                await sub.update({ lastused: new Date() });

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

        res.json({
            success: true,
            message: `Notificação enviada para ${successful} dispositivos`,
            details: {
                total: subscriptions.length,
                successful,
                failed,
            },
        });
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function getNotifications(req, res) {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const userId = req.user.userId;

        const notifications = await models.Notification.findAll({
            where: { userid: userId },
            attributes: ['id', 'title', 'message', 'sentat', 'readat'],
            order: [['sentat', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function markAsRead(req, res) {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;

        const notification = await models.Notification.findOne({
            where: {
                id: notificationId,
                userid: userId,
            },
        });

        if (!notification) {
            return res
                .status(404)
                .json({ error: 'Notificação não encontrada' });
        }

        await notification.update({ readat: new Date() });

        res.json({
            success: true,
            message: 'Notificação marcada como lida',
        });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
