import { v4 as uuidv4 } from 'uuid';
import { models } from '../models/index.js';
import { generateUniqueUsername } from '../utils/helpers/generate-username.helper.js';
import { TokenService } from '../services/token.service.js';
import { timezone } from '../utils/formatters/timezone.js';

export class UserService {
    static async register(name, password) {
        const username = await generateUniqueUsername(name);

        if (!username) {
            throw new Error('Nome de usuário indisponível');
        }

        const newUser = await models.User.create({
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
        const user = await models.User.findOne({
            where: { username },
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (password !== user.password) {
            throw new Error('Senha incorreta');
        }

        const [device] = await models.Device.findOrCreate({
            where: { id: deviceId },
            defaults: {
                name:
                    deviceName?.trim() ||
                    `Dispositivo ${timezone.now().toLocaleDateString('pt-BR')}`,
            },
        });

        await device.update({ lastseen: timezone.now() });

        const { accessToken, refreshToken } = await TokenService.generateTokens(
            user.id,
            deviceId,
        );

        const [accountDevice] = await models.AccountDevice.findOrCreate({
            where: {
                userid: user.id,
                deviceid: deviceId,
            },
            defaults: {
                accesstoken: accessToken,
            },
        });

        if (!accountDevice.isNewRecord) {
            await accountDevice.update({
                accesstoken: accessToken,
                lastused: timezone.now(),
            });
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
        const user = await models.User.findByPk(userId, {
            attributes: ['id', 'name', 'username', 'password', 'createdat'],
        });

        return user;
    }

    static async logoutAccount(userId, deviceId) {
        await TokenService.revokeAllUserTokens(userId, deviceId);

        await models.AccountDevice.destroy({
            where: { userid: userId, deviceid: deviceId },
        });

        await models.PushSubscription.destroy({
            where: { userid: userId, deviceid: deviceId },
        });

        return {
            success: true,
            message: 'Conta removida do dispositivo',
        };
    }
}
