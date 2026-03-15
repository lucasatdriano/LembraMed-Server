import jwt from 'jsonwebtoken';
import { AccountDeviceRepository } from '../repositories/account-device.repository.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token de acesso necessário',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const accountDevice = await AccountDeviceRepository.findByToken(
            decoded.userId,
            decoded.deviceId,
            token,
        );

        if (!accountDevice) {
            return res.status(401).json({
                error: 'Token inválido ou expirado',
            });
        }

        req.user = {
            userId: decoded.userId,
            deviceId: decoded.deviceId,
        };

        next();
    } catch (error) {
        logger.error(
            {
                message: error.message,
                stack: error.stack,
            },
            'Erro na autenticação:',
        );

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
            });
        }

        return res.status(500).json({
            error: 'Erro interno do servidor',
        });
    }
};
