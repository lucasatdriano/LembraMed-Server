import { DeviceService } from '../services/device.service.js';

export async function getDeviceAccounts(req, res) {
    try {
        const { deviceid } = req.params;

        const formattedAccounts =
            await DeviceService.getDeviceAccounts(deviceid);

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

        const result = await DeviceService.registerPushSubscription(
            userid,
            deviceid,
            subscription,
        );

        res.json({
            success: true,
            message: 'Subscription registrada com sucesso',
            subscriptionId: result.subscriptionId,
        });
    } catch (error) {
        console.error('Erro ao registrar subscription:', error);

        if (error.message === 'Conta não encontrada neste dispositivo') {
            return res.status(404).json({
                error: error.message,
            });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function removeDevice(req, res) {
    try {
        const { deviceId } = req.params;

        await DeviceService.removeDevice(deviceId);

        res.json({ success: true, message: 'Dispositivo removido' });
    } catch (error) {
        console.error('Erro ao remover dispositivo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
