import { v4 as uuidv4 } from 'uuid';
import { models } from '../models/index.js';
import { generateUniqueUsername } from '../utils/helpers/generateUsername.js';
import { TokenService } from '../services/tokenService.js';
import { timezone } from '../utils/formatters/timezone.js';
import { validationUser } from '../utils/validations/userValidation.js';

export async function register(req, res) {
    const { name, password } = req.body;

    try {
        const validationResult = validationUser.register({ name, password });

        if (!validationResult.isValid) {
            console.log('❌ Erros de validação:', validationResult.errors);
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationResult.errors,
            });
        }

        const username = await generateUniqueUsername(name);

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

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('❌ Erro ao cadastrar usuário:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Erro ao cadastrar',
                details: ['Este nome de usuário já está em uso'],
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map((e) => e.message),
            });
        }

        res.status(500).json({
            error: 'Erro ao cadastrar usuário.',
            details: error.message,
        });
    }
}

export async function loginMultiAccount(req, res) {
    try {
        const { username, password, deviceId, deviceName } = req.body;

        const validationResult = validationUser.login({
            username,
            password,
            deviceId,
        });

        if (!validationResult.isValid) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationResult.errors,
            });
        }

        const user = await models.User.findOne({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                details: ['Usuário não encontrado'],
            });
        }

        if (password !== user.password) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                details: ['Senha incorreta'],
            });
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
        console.error('❌ Erro no login multi-conta:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(500).json({
                error: 'Erro na geração de tokens',
                details: ['Falha ao gerar tokens de autenticação'],
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor',
            details: [error.message],
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
