import { models } from '../models/index.js';
import { AuthService } from '../services/auth.service.js';
import { TokenService } from '../services/token.service.js';
import { timezone } from '../utils/formatters/timezone.js';

export async function refreshMultiAccountToken(req, res) {
    try {
        const { refreshToken, deviceId } = req.body;

        if (!refreshToken || !deviceId) {
            return res.status(400).json({
                error: 'Refresh token e deviceId são obrigatórios',
            });
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
            userId,
        } = await TokenService.refreshTokens(refreshToken, deviceId);

        await models.AccountDevice.update(
            {
                accesstoken: accessToken,
                lastused: timezone.now(),
            },
            {
                where: {
                    userid: userId,
                    deviceid: deviceId,
                },
            },
        );

        res.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Erro no refresh token multi-conta:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function tokenStatus(req, res) {
    try {
        const { refreshToken, deviceId } = req.query;

        if (!refreshToken || !deviceId) {
            return res.status(400).json({
                error: 'Parâmetros necessários: refreshToken e deviceId',
            });
        }

        const isValid = await TokenService.isValidRefreshToken(
            refreshToken,
            deviceId,
        );

        res.json({
            isValid,
            message: isValid ? 'Token válido' : 'Token inválido ou expirado',
        });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email é obrigatório' });
        }

        await AuthService.sendPasswordResetEmail(email);

        res.json({ message: 'E-mail enviado com sucesso' });
    } catch (error) {
        console.error('Erro no forgot password:', error);

        if (error.message === 'Usuário não encontrado') {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({
            error: 'Erro ao enviar e-mail',
            details: error.message,
        });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token não fornecido.' });
        }

        if (!newPassword) {
            return res
                .status(400)
                .json({ message: 'Nova senha não fornecida.' });
        }

        await AuthService.resetPassword(token, newPassword);

        res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error('Erro no reset password:', error);

        if (error.message === 'Usuário não encontrado') {
            return res.status(404).json({ message: error.message });
        }

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res
                .status(401)
                .json({ message: 'Token inválido ou expirado' });
        }

        res.status(500).json({
            error: 'Erro ao redefinir senha',
            details: error.message,
        });
    }
}
