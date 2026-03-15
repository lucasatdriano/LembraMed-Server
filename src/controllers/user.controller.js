import { UserService } from '../services/users/user.service.js';
import { validationUser } from '../utils/validations/user.validation.js';
import { AppError } from '../utils/errors/app.error.js';

export async function register(req, res) {
    const { name, password } = req.body;

    const validation = validationUser.register({ name, password });

    if (!validation.isValid) {
        throw new AppError('Dados inválidos', 400);
    }

    const { normalized } = validation;

    const userResponse = await UserService.register(
        normalized.name,
        normalized.password,
    );

    return res.status(201).json(userResponse);
}

export async function loginMultiAccount(req, res) {
    const { username, password, deviceId, deviceName } = req.body;

    const validation = validationUser.login({
        username,
        password,
        deviceId,
    });

    if (!validation.isValid) {
        throw new AppError('Dados inválidos', 400);
    }

    const result = await UserService.loginMultiAccount(
        username,
        password,
        deviceId,
        deviceName,
    );

    return res.json(result);
}

export async function getUserById(req, res) {
    const userId = req.user.userId;

    const user = await UserService.getUserById(userId);

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    return res.json(user);
}

export async function logoutAccount(req, res) {
    const { deviceId } = req.body;
    const userId = req.user.userId;

    if (!deviceId) {
        throw new AppError('DeviceId é obrigatório', 400);
    }

    const result = await UserService.logoutAccount(userId, deviceId);

    return res.json(result);
}
