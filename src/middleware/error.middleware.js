import { AppError } from '../utils/errors/app.error.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Registro já existente',
        });
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.errors.map((e) => e.message),
        });
    }

    logger.error(
        {
            message: err.message,
            stack: err.stack,
        },
        'Erro inesperado:',
    );

    return res.status(500).json({
        error: 'Erro interno do servidor',
    });
}
