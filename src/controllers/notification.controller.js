import { NotificationService } from '../services/notification.service.js';

export async function sendNotification(req, res) {
    try {
        const { title, message, tag } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({
                error: 'Title é obrigatório',
            });
        }

        const result = await NotificationService.sendNotification(
            userId,
            title,
            message,
            tag,
        );

        res.json(result);
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);

        if (
            error.message ===
            'Nenhuma subscription encontrada para este usuário'
        ) {
            return res.status(404).json({
                error: error.message,
            });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function getNotifications(req, res) {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const userId = req.user.userId;

        const notifications = await NotificationService.getNotifications(
            userId,
            limit,
            offset,
        );

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

        const result = await NotificationService.markAsRead(
            userId,
            notificationId,
        );

        if (!result) {
            return res
                .status(404)
                .json({ error: 'Notificação não encontrada' });
        }

        res.json({
            success: true,
            message: 'Notificação marcada como lida',
        });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
