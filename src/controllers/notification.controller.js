import { NotificationService } from '../services/notification/notification.service.js';
import { AppError } from '../utils/errors/app.error.js';

export async function getVapidPublicKey(req, res) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
        throw new AppError('VAPID public key não configurada', 500);
    }

    return res.json({ publicKey });
}

export async function subscribe(req, res) {
    const userId = req.user.userId;
    const subscription = req.body;

    if (!subscription?.endpoint) {
        throw new AppError('Endpoint não fornecido', 400);
    }

    if (!subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        throw new AppError('Chaves da subscription inválidas', 400);
    }

    const result = await NotificationService.saveSubscription(
        userId,
        subscription,
    );

    return res.json({
        success: true,
        message: 'Inscrição realizada com sucesso',
        subscriptionId: result.id,
    });
}

export async function unsubscribe(req, res) {
    const { endpoint } = req.body;

    if (!endpoint) {
        throw new AppError('Endpoint é obrigatório', 400);
    }

    await NotificationService.removeSubscription(endpoint);

    return res.json({
        success: true,
        message: 'Inscrição removida com sucesso',
    });
}

export async function sendNotification(req, res) {
    const userId = req.user.userId;
    const { title, message, tag } = req.body;

    if (!title) {
        throw new AppError('Título é obrigatório', 400);
    }

    const result = await NotificationService.sendNotification(
        userId,
        title,
        message,
        tag,
    );

    return res.json(result);
}

export async function getNotifications(req, res) {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await NotificationService.getNotifications(
        userId,
        Number(limit),
        Number(offset),
    );

    return res.json({
        success: true,
        notifications,
    });
}

export async function markAsRead(req, res) {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const result = await NotificationService.markAsRead(userId, notificationId);

    if (!result) {
        throw new AppError('Notificação não encontrada', 404);
    }

    return res.json({
        success: true,
        message: 'Notificação marcada como lida',
    });
}
