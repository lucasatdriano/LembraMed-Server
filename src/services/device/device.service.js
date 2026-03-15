import { TokenService } from '../auth/token.service.js';
import { timezone } from '../../utils/formatters/timezone.js';
import { AppError } from '../../utils/errors/app.error.js';
import { DeviceRepository } from '../../repositories/device.repository.js';
import { PushSubscriptionRepository } from '../../repositories/push-subscription.repository.js';

export class DeviceService {
    static async getDeviceAccounts(deviceId) {
        const accounts = await DeviceRepository.findAccountsByDevice(deviceId);

        return accounts.map((acc) => ({
            userid: acc.user.id,
            name: acc.user.name,
            username: acc.user.username,
            lastused: acc.lastused,
            createdat: acc.createdat,
        }));
    }

    static async registerPushSubscription(userId, deviceId, subscription) {
        const account = await DeviceRepository.findAccount(userId, deviceId);

        if (!account) {
            throw new AppError('Conta não encontrada neste dispositivo', 404);
        }

        const [pushSub] =
            await PushSubscriptionRepository.upsertPushSubscription({
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

        await DeviceRepository.deleteDevice(deviceId);

        return {
            success: true,
            message: 'Dispositivo removido',
        };
    }
}
