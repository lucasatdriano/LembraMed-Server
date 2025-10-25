import { models } from '../models/index.js';
import { TokenService } from '../services/tokenService.js';

export async function getDeviceAccounts(req, res) {
    try {
        const { deviceid } = req.params;

        const accounts = await models.AccountDevice.findAll({
            where: { deviceid: deviceid },
            include: [
                {
                    model: models.User,
                    attributes: ['id', 'name', 'username'],
                    as: 'user',
                },
            ],
            order: [['lastused', 'DESC']],
        });

        const formattedAccounts = accounts.map((acc) => ({
            userid: acc.user.id,
            name: acc.user.name,
            username: acc.user.username,
            lastused: acc.lastused,
            createdat: acc.createdat,
        }));

        res.json({ success: true, accounts: formattedAccounts });
    } catch (error) {
        console.error('Erro ao buscar contas do dispositivo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function registerPushSubscription(req, res) {
    try {
        const { userid, deviceid, subscription } = req.body;

        if (!userid || !deviceid || !subscription) {
            return res.status(400).json({
                error: 'UserID, deviceId e subscription são obrigatórios',
            });
        }

        const accountExists = await models.AccountDevice.findOne({
            where: { userid, deviceid },
        });

        if (!accountExists) {
            return res.status(404).json({
                error: 'Conta não encontrada neste dispositivo',
            });
        }

        const [pushSub] = await models.PushSubscription.upsert({
            userid,
            deviceid,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            lastused: new Date(),
        });

        res.json({
            success: true,
            message: 'Subscription registrada com sucesso',
            subscriptionId: pushSub.id,
        });
    } catch (error) {
        console.error('Erro ao registrar subscription:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function removeDevice(req, res) {
    try {
        const { deviceId } = req.params;

        await TokenService.revokeAllUserTokens(null, deviceId);

        await models.Device.destroy({
            where: { id: deviceId },
        });

        res.json({ success: true, message: 'Dispositivo removido' });
    } catch (error) {
        console.error('Erro ao remover dispositivo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
