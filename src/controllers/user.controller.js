import { UserService } from '../services/user.service.js';
import { validationUser } from '../utils/validations/user.validation.js';

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

        const userResponse = await UserService.register(name, password);

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('❌ Erro ao cadastrar usuário:', error);

        if (error.message === 'Nome de usuário indisponível') {
            return res.status(409).json({
                error: 'Nome de usuário indisponível',
                details: [
                    'Este nome de usuário já está em uso. Tente um nome diferente.',
                ],
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

        const result = await UserService.loginMultiAccount(
            username,
            password,
            deviceId,
            deviceName,
        );

        res.json(result);
    } catch (error) {
        console.error('❌ Erro no login multi-conta:', error);

        if (
            error.message === 'Usuário não encontrado' ||
            error.message === 'Senha incorreta'
        ) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                details: [
                    error.message === 'Usuário não encontrado'
                        ? 'Usuário não encontrado'
                        : 'Senha incorreta',
                ],
            });
        }

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

        const user = await UserService.getUserById(userId);

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

        const result = await UserService.logoutAccount(userId, deviceId);

        res.json(result);
    } catch (error) {
        console.error('Erro no logout multi-conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message,
        });
    }
}
