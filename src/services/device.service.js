import { models } from '../models/index.js';
import { TokenService } from './token.service.js';
import { timezone } from '../utils/formatters/timezone.js';

export class DeviceService {
    static async getDeviceAccounts(deviceId) {
        const accounts = await models.AccountDevice.findAll({
            where: { deviceid: deviceId },
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

        return formattedAccounts;
    }

    static async registerPushSubscription(userId, deviceId, subscription) {
        const accountExists = await models.AccountDevice.findOne({
            where: { userid: userId, deviceid: deviceId },
        });

        if (!accountExists) {
            throw new Error('Conta não encontrada neste dispositivo');
        }

        const [pushSub] = await models.PushSubscription.upsert({
            userid: userId,
            deviceid: deviceId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            lastused: timezone.now(),
        });

        return { subscriptionId: pushSub.id };
    }

    static async removeDevice(deviceId) {
        await TokenService.revokeAllUserTokens(null, deviceId);

        await models.Device.destroy({
            where: { id: deviceId },
        });

        return { success: true, message: 'Dispositivo removido' };
    }
}
