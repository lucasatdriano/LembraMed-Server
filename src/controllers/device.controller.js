import { DeviceService } from '../services/device/device.service.js';
import { AppError } from '../utils/errors/app.error.js';

export async function getDeviceAccounts(req, res) {
    const { deviceid } = req.params;

    const accounts = await DeviceService.getDeviceAccounts(deviceid);

    return res.json({
        success: true,
        accounts,
    });
}

export async function registerPushSubscription(req, res) {
    const { userid, deviceid, subscription } = req.body;

    if (!userid || !deviceid || !subscription) {
        throw new AppError(
            'UserID, deviceId e subscription são obrigatórios',
            400,
        );
    }

    const result = await DeviceService.registerPushSubscription(
        userid,
        deviceid,
        subscription,
    );

    return res.json({
        success: true,
        message: 'Subscription registrada com sucesso',
        subscriptionId: result.subscriptionId,
    });
}

export async function removeDevice(req, res) {
    const { deviceid } = req.params;

    const result = await DeviceService.removeDevice(deviceid);

    return res.json(result);
}
