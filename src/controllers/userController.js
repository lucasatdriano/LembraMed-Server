import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { models } from '../models/index.js';
import { generateUniqueUsername } from '../utils/generateUsername.js';
import { TokenService } from '../services/tokenService.js';

export async function register(req, res) {
    const { name, password } = req.body;

    try {
        const username = await generateUniqueUsername(name);

        const newUser = await models.User.create({
            id: uuidv4(),
            name,
            username: username,
            password,
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao cadastrar usuário.',
            details: error.message,
        });
    }
}

export async function loginMultiAccount(req, res) {
    try {
        const { username, password, deviceId, deviceName } = req.body;

        if (!username || !password || !deviceId) {
            return res.status(400).json({
                error: 'Username, password e deviceId são obrigatórios',
            });
        }

        const user = await models.User.findOne({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const validPassword = password === user.password;
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const [device] = await models.Device.findOrCreate({
            where: { id: deviceId },
            defaults: {
                name:
                    deviceName ||
                    `Dispositivo ${new Date().toLocaleDateString()}`,
            },
        });

        await device.update({ lastseen: new Date() });

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
                lastused: new Date(),
            });
        }

        res.json({
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
        });
    } catch (error) {
        console.error('Erro no login multi-conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message,
        });
    }
}

export async function getUserById(req, res) {
    try {
        const userId = req.user.userId;

        const user = await models.User.findByPk(userId, {
            attributes: ['id', 'name', 'username', 'password', 'createdat'],
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
}

export async function logoutAccount(req, res) {
    try {
        const { deviceId } = req.body;
        const userId = req.user.userId;

        if (!deviceId) {
            return res.status(400).json({
                error: 'DeviceId é obrigatório',
            });
        }

        await TokenService.revokeAllUserTokens(userId, deviceId);

        await models.AccountDevice.destroy({
            where: { userid: userId, deviceid: deviceId },
        });

        await models.PushSubscription.destroy({
            where: { userid: userId, deviceid: deviceId },
        });

        res.json({
            success: true,
            message: 'Conta removida do dispositivo',
        });
    } catch (error) {
        console.error('Erro no logout multi-conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message,
        });
    }
}
