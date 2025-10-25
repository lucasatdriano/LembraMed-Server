import jwt from 'jsonwebtoken';
import { models } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res
                .status(401)
                .json({ error: 'Token de acesso necessário' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const accountDevice = await models.AccountDevice.findOne({
            where: {
                userid: decoded.userId,
                deviceid: decoded.deviceId,
                accesstoken: token,
            },
        });

        if (!accountDevice) {
            return res
                .status(401)
                .json({ error: 'Token inválido ou expirado' });
        }

        req.user = {
            userId: decoded.userId,
            deviceId: decoded.deviceId,
        };

        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
