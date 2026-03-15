import { AuthService } from '../services/auth/auth.service.js';
import { TokenService } from '../services/auth/token.service.js';
import { AccountDeviceRepository } from '../repositories/account-device.repository.js';
import { AppError } from '../utils/errors/app.error.js';
import { timezone } from '../utils/formatters/timezone.js';

export async function refreshMultiAccountToken(req, res) {
    const { refreshToken, deviceId } = req.body;

    if (!refreshToken || !deviceId) {
        throw new AppError('Refresh token e deviceId são obrigatórios', 400);
    }

    const {
        accessToken,
        refreshToken: newRefreshToken,
        userId,
    } = await TokenService.refreshTokens(refreshToken, deviceId);

    await AccountDeviceRepository.updateAccessToken(
        userId,
        deviceId,
        accessToken,
        timezone.now(),
    );

    return res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
    });
}

export async function tokenStatus(req, res) {
    const { refreshToken, deviceId } = req.query;

    if (!refreshToken || !deviceId) {
        throw new AppError(
            'Parâmetros necessários: refreshToken e deviceId',
            400,
        );
    }

    const isValid = await TokenService.isValidRefreshToken(
        refreshToken,
        deviceId,
    );

    return res.json({
        isValid,
        message: isValid ? 'Token válido' : 'Token inválido ou expirado',
    });
}

export async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Email é obrigatório', 400);
    }

    await AuthService.sendPasswordResetEmail(email);

    return res.json({
        message: 'E-mail enviado com sucesso',
    });
}

export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token) {
        throw new AppError('Token não fornecido', 400);
    }

    if (!newPassword) {
        throw new AppError('Nova senha não fornecida', 400);
    }

    await AuthService.resetPassword(token, newPassword);

    return res.json({
        message: 'Senha redefinida com sucesso!',
    });
}
