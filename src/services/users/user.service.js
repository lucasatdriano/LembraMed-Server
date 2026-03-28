import { v4 as uuidv4 } from 'uuid';
import { generateUniqueUsername } from '../../utils/helpers/generate-username.helper.js';
import { TokenService } from '../auth/token.service.js';
import { dateTime } from '../../utils/formatters/date-time.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { AccountDeviceRepository } from '../../repositories/account-device.repository.js';
import { PushSubscriptionRepository } from '../../repositories/push-subscription.repository.js';
import { DeviceRepository } from '../../repositories/device.repository.js';

export class UserService {
    static async register(name, password) {
        const username = await generateUniqueUsername(name);

        if (!username) {
            throw new Error('Nome de usuário indisponível');
        }

        const newUser = await UserRepository.create({
            id: uuidv4(),
            name: name.trim(),
            username: username,
            password,
        });

        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            createdat: newUser.createdat,
        };

        return userResponse;
    }

    static async loginMultiAccount(username, password, deviceId, deviceName) {
        const user = await UserRepository.findByUsername(username);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (password !== user.password) {
            throw new Error('Senha incorreta');
        }

        await DeviceRepository.findOrCreateDevice(
            deviceId,
            deviceName?.trim() ||
                `Dispositivo ${dateTime.now().toLocaleDateString('pt-BR')}`,
        );

        await DeviceRepository.updateLastSeen(deviceId, dateTime.now());

        const { accessToken, refreshToken } = await TokenService.generateTokens(
            user.id,
            deviceId,
        );

        const [accountDevice] = await AccountDeviceRepository.findOrCreate(
            user.id,
            deviceId,
            accessToken,
        );

        if (!accountDevice.isNewRecord) {
            await AccountDeviceRepository.updateAccessToken(
                user.id,
                deviceId,
                accessToken,
                dateTime.now(),
            );
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
            deviceId,
        };
    }

    static async getUserById(userId) {
        const user = await UserRepository.findById(userId);

        return user;
    }

    static async logoutAccount(userId, deviceId) {
        await TokenService.revokeAllUserTokens(userId, deviceId);

        await AccountDeviceRepository.deleteAccount(userId, deviceId);

        await PushSubscriptionRepository.deleteSubscription(userId, deviceId);

        return {
            success: true,
            message: 'Conta removida do dispositivo',
        };
    }
}
