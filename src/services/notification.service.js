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

        const payload = JSON.stringify({
            title,
            body: message || '',
            userid: userId,
            tag: tag || `notif-${userId}`,
            timestamp: timezone.now().toISOString(),
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
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
                console.error(`Erro ao enviar:`, error);
                if (error.statusCode === 410) {
                    await sub.destroy();
                }
                return { success: false, subscriptionId: sub.id };
            }
        });

        const results = await Promise.all(sendPromises);

        const notification = await models.Notification.create({
            userid: userId,
            title,
            message: message || null,
        });

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return {
            success: true,
            notificationId: notification.id,
            message: `Notificação enviada para ${successful} dispositivos`,
            details: {
                total: subscriptions.length,
                successful,
                failed,
            },
        };
    }

    static async getNotifications(userId, limit, offset) {
        return await models.Notification.findAll({
            where: { userid: userId },
            attributes: ['id', 'title', 'message', 'sentat', 'readat'],
            order: [['sentat', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    }

    static async markAsRead(userId, notificationId) {
        const notification = await models.Notification.findOne({
            where: { id: notificationId, userid: userId },
        });

        if (!notification) return null;

        await notification.update({ readat: timezone.now() });
        return notification;
    }

    static getVapidPublicKey() {
        return process.env.VAPID_PUBLIC_KEY;
    }

    static async saveSubscription(userId, subscription) {
        try {
            if (!models.PushSubscription) {
                console.error('Modelo PushSubscription não encontrado!');
                throw new Error('Modelo PushSubscription não configurado');
            }

            if (!subscription.endpoint) {
                throw new Error('endpoint é obrigatório');
            }
            if (
                !subscription.keys ||
                !subscription.keys.p256dh ||
                !subscription.keys.auth
            ) {
                throw new Error('keys incompletas');
            }

            const deviceId = subscription.deviceId || null;

            console.log('📱 Device ID recebido:', deviceId);

            const [sub, created] = await models.PushSubscription.findOrCreate({
                where: { endpoint: subscription.endpoint },
                defaults: {
                    userid: userId,
                    deviceid: deviceId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    lastused: timezone.now(),
                },
            });

            if (!created) {
                console.log('🔄 Atualizando subscription existente:', sub.id);
                await sub.update({
                    userid: userId,
                    deviceid: deviceId,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    lastused: timezone.now(),
                });
            } else {
                console.log('✅ Nova subscription criada:', sub.id);
            }

            return sub;
        } catch (error) {
            console.error('Erro em saveSubscription:', error);
            throw error;
        }
    }

    static async removeSubscription(endpoint) {
        return await models.PushSubscription.destroy({
            where: { endpoint },
        });
    }

    static async sendMedicationReminder(
        userId,
        medicationId,
        medicationName,
        doseTime,
        reminderType,
    ) {
        console.log(
            `💊 [MedicationReminder] Enviando lembrete para usuário: ${userId}`,
        );
        console.log(`💊 [MedicationReminder] Medicamento: ${medicationName}`);
        console.log(`💊 [MedicationReminder] Tipo: ${reminderType}`);

        let title, message, tag;

        switch (reminderType) {
            case 'initial':
                title = '💊 Hora do Medicamento';
                message = `Está na hora de tomar ${medicationName} (${doseTime}). Não se esqueça!`;
                tag = `med-${medicationId}-initial`;
                break;

            case 'reminder':
                title = '⏰ Lembrete de Medicamento';
                message = `Ainda não confirmou ${medicationName}. Por favor, tome agora!`;
                tag = `med-${medicationId}-reminder`;
                break;

            case 'missed':
                title = '⚠️ Dose Perdida';
                message = `Você perdeu o horário de ${medicationName} (${doseTime}). Tome assim que possível.`;
                tag = `med-${medicationId}-missed`;
                break;

            case 'tolerance-warning':
                title = '⌛ Período de Tolerância';
                message = `Ainda há tempo para tomar ${medicationName}, mas o prazo está acabando!`;
                tag = `med-${medicationId}-warning`;
                break;

            default:
                title = '💊 Lembrete de Medicamento';
                message = `Não esqueça de tomar ${medicationName}!`;
                tag = `med-${medicationId}`;
        }

        const notification = await models.Notification.create({
            userid: userId,
            title,
            message,
        });

        console.log(`📝 [PUSH] Notificação salva no banco: ${notification.id}`);

        const subscriptions = await models.PushSubscription.findAll({
            where: { userid: userId },
        });

        console.log(
            `🔍 [PUSH] Encontradas ${subscriptions.length} subscriptions`,
        );

        if (subscriptions.length === 0) {
            console.log(
                `⚠️ [PUSH] Nenhuma subscription encontrada para o usuário ${userId}`,
            );
            console.log(`📝 [PUSH] Notificação salva apenas no banco de dados`);
            return {
                success: true,
                notificationId: notification.id,
                message: 'Notificação salva no banco (sem push)',
                details: { total: 0, successful: 0 },
            };
        }

        const payload = JSON.stringify({
            title,
            body: message,
            userid: userId,
            tag,
            timestamp: new Date().toISOString(),
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                medicationId,
                medicationName,
                doseTime,
                reminderType,
                url: `/medicamentos/${medicationId}`,
            },
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
                console.error(`Erro ao enviar:`, error);

                if (error.statusCode === 410) {
                    console.log(
                        `🗑️ Subscription ${sub.id} expirada, removendo...`,
                    );
                    await sub.destroy();
                }

                if (error.statusCode === 404) {
                    console.log(`⚠️ Endpoint não encontrado, removendo...`);
                    await sub.destroy();
                }

                return { success: false, subscriptionId: sub.id };
            }
        });

        const results = await Promise.all(sendPromises);

        const successful = results.filter((r) => r.success).length;

        console.log(
            `✅ [MedicationReminder] Notificações enviadas: ${successful}/${subscriptions.length}`,
        );

        return {
            success: successful > 0,
            notificationId: notification.id,
            details: {
                total: subscriptions.length,
                successful,
            },
        };
    }

    static async cleanupOldNotifications(daysToKeep = 30) {
        try {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - daysToKeep);

            const deleted = await models.Notification.destroy({
                where: {
                    sentat: {
                        [Op.lt]: dataLimite,
                    },
                    readat: {
                        [Op.ne]: null,
                    },
                },
            });

            console.log(
                `🧹 Limpeza: ${deleted} notificações antigas removidas`,
            );
            return deleted;
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
        }
    }
}
