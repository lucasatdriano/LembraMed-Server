import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    sendNotification,
    getNotifications,
    markAsRead,
} from '../controllers/notification.controller.js';
import { NotificationService } from '../services/notification.service.js';

const router = express.Router();

router.get('/vapid-public-key', (req, res) => {
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
});

router.use(authenticateToken);

router.post('/subscribe', async (req, res) => {
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
});

router.post('/unsubscribe', async (req, res) => {
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
});

router.post('/send', sendNotification);
router.get('/', getNotifications);
router.patch('/:notificationid/read', markAsRead);

export default router;
