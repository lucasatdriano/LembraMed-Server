import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class TokenService {
    static async generateTokens(userId, deviceId) {
        try {
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

            await models.RefreshToken.create({
                token: refreshToken,
                userid: userId,
                deviceid: deviceId,
                expiresat: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7d
            });

            return { accessToken, refreshToken, userId };
        } catch (error) {
            console.error('Erro ao gerar tokens:', error);
            throw error;
        }
    }

    static async refreshTokens(oldRefreshToken, deviceId) {
        try {
            const storedToken = await models.RefreshToken.findOne({
                where: {
                    token: oldRefreshToken,
                    deviceid: deviceId,
                    revoked: false,
                    expiresat: { [Op.gt]: new Date() },
                },
            });

            if (!storedToken) {
                throw new Error('Refresh token não encontrado ou expirado');
            }

            const decoded = jwt.verify(
                oldRefreshToken,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            );

            await storedToken.update({ revoked: true });

            const { accessToken, refreshToken: newRefreshToken } =
                await this.generateTokens(decoded.userId, deviceId);

            return {
                accessToken,
                refreshToken: newRefreshToken,
                userId: decoded.userId,
            };
        } catch (error) {
            console.error('Erro ao refresh tokens:', error);

            if (
                error.name === 'JsonWebTokenError' ||
                error.name === 'TokenExpiredError'
            ) {
                await this.revokeAllUserTokens(null, deviceId);
            }

            throw error;
        }
    }

    static async revokeAllUserTokens(userId = null, deviceId = null) {
        try {
            const whereClause = { revoked: false };

            if (userId) {
                whereClause.userid = userId;
            }

            if (deviceId) {
                whereClause.deviceid = deviceId;
            }

            await models.RefreshToken.update(
                { revoked: true },
                { where: whereClause },
            );
        } catch (error) {
            console.error('Erro ao revogar tokens:', error);
            throw error;
        }
    }

    static async cleanupExpiredTokens() {
        try {
            await models.RefreshToken.destroy({
                where: {
                    [Op.or]: [
                        { revoked: true },
                        { expiresat: { [Op.lt]: new Date() } },
                    ],
                },
            });
            console.log('Tokens expirados limpos com sucesso');
        } catch (error) {
            console.error('Erro ao limpar tokens expirados:', error);
            throw error;
        }
    }

    static async isValidRefreshToken(token, deviceId) {
        try {
            const storedToken = await models.RefreshToken.findOne({
                where: {
                    token: token,
                    deviceid: deviceId,
                    revoked: false,
                    expiresat: { [Op.gt]: new Date() },
                },
            });

            return !!storedToken;
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            return false;
        }
    }
}
