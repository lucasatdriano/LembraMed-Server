import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { timezone } from '../../utils/formatters/timezone.js';
import { refreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import { AppError } from '../../utils/errors/app.error.js';

export class TokenService {
    static async generateTokens(userId, deviceId) {
        const accessToken = jwt.sign(
            {
                userId,
                deviceId,
                type: 'multi-account',
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        );

        const refreshToken = jwt.sign(
            {
                userId,
                deviceId,
                type: 'refresh',
            },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: '7d' },
        );

        await refreshTokenRepository.createRefreshToken({
            token: refreshToken,
            userid: userId,
            deviceid: deviceId,
            expiresat: timezone.now(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            accessToken,
            refreshToken,
            userId,
        };
    }

    static async refreshTokens(oldRefreshToken, deviceId) {
        const storedToken = await refreshTokenRepository.findRefreshToken({
            where: {
                token: oldRefreshToken,
                deviceid: deviceId,
                revoked: false,
                expiresat: { [Op.gt]: timezone.now() },
            },
        });

        if (!storedToken) {
            throw new AppError('Refresh token não encontrado ou expirado', 401);
        }

        let decoded;

        try {
            decoded = jwt.verify(
                oldRefreshToken,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            );
        } catch (error) {
            await this.revokeAllUserTokens(null, deviceId);

            throw new AppError('Token inválido ou expirado', 401);
        }

        await storedToken.update({ revoked: true });

        const { accessToken, refreshToken } = await this.generateTokens(
            decoded.userId,
            deviceId,
        );

        return {
            accessToken,
            refreshToken,
            userId: decoded.userId,
        };
    }

    static async revokeAllUserTokens(userId = null, deviceId = null) {
        const whereClause = {
            revoked: false,
        };

        if (userId) {
            whereClause.userid = userId;
        }

        if (deviceId) {
            whereClause.deviceid = deviceId;
        }

        await refreshTokenRepository.revokeRefreshToken(whereClause);
    }

    static async cleanupExpiredTokens() {
        await refreshTokenRepository.deleteRefreshToken(timezone.now());
    }

    static async isValidRefreshToken(token, deviceId) {
        const storedToken = await refreshTokenRepository.findRefreshToken({
            where: {
                token,
                deviceid: deviceId,
                revoked: false,
                expiresat: { [Op.gt]: timezone.now() },
            },
        });

        return !!storedToken;
    }
}
