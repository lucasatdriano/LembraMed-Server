import { NotificationService } from '../services/notification.service.js';

export async function getVapidPublicKey(req, res) {
    try {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        if (!publicKey) {
            return res.status(500).json({
                error: 'VAPID public key não configurada',
            });
        }
        res.json({ publicKey });
    } catch (error) {
        console.error('Erro ao buscar chave VAPID:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function subscribe(req, res) {
    try {
        const userId = req.user.userId;
        const subscription = req.body;

        if (!subscription) {
            console.error('Subscription não fornecida');
            return res
                .status(400)
                .json({ error: 'Subscription não fornecida' });
        }

        if (!subscription.endpoint) {
            console.error('❌ Endpoint não fornecido');
            return res.status(400).json({ error: 'Endpoint não fornecido' });
        }

        if (
            !subscription.keys ||
            !subscription.keys.p256dh ||
            !subscription.keys.auth
        ) {
            console.error('❌ Chaves da subscription inválidas');
            return res
                .status(400)
                .json({ error: 'Chaves da subscription inválidas' });
        }

        const result = await NotificationService.saveSubscription(
            userId,
            subscription,
        );

        res.json({
            success: true,
            message: 'Inscrição realizada com sucesso',
            subscriptionId: result.id,
        });
    } catch (error) {
        console.error('Erro ao salvar subscription:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message,
        });
    }
}

export async function unsubscribe(req, res) {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint é obrigatório' });
        }

        await NotificationService.removeSubscription(endpoint);

        res.json({
            success: true,
            message: 'Inscrição removida com sucesso',
        });
    } catch (error) {
        console.error('Erro ao remover subscription:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function sendNotification(req, res) {
    try {
        const { title, message, tag } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({
                error: 'Título é obrigatório',
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
