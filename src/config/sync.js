import sequelize from './db.js';
import { logger } from '../utils/logger.js';

const syncDatabase = async () => {
    logger.debug('Starting database synchronization');

    try {
        await sequelize.sync({ force: false });

        logger.info('Database models synchronized successfully');
    } catch (error) {
        logger.error(
            {
                message: error.message,
                stack: error.stack,
                errorType: error.constructor?.name,
                originalError: error.original?.message,
            },
            'Error while synchronizing database models',
        );
    }
};

logger.debug('syncDatabase module loaded');

export default syncDatabase;
