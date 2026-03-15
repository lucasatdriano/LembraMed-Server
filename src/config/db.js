import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';

logger.debug(
    {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        DB_DIALECT: process.env.DB_DIALECT,
    },
    'Variáveis de ambiente carregadas',
);

const isProduction = process.env.NODE_ENV === 'production';
const isUsingRenderDB =
    process.env.DB_HOST && process.env.DB_HOST.includes('render.com');

logger.debug(
    {
        isProduction,
        isUsingRenderDB,
    },
    'Database environment flags',
);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        logging: (sql) => {
            logger.debug({ sql }, 'SQL query executed');
        },
        dialectOptions:
            isProduction || isUsingRenderDB
                ? {
                      ssl: {
                          require: true,
                          rejectUnauthorized: false,
                      },
                  }
                : {
                      ssl: false,
                  },
    },
);

logger.debug('Sequelize connection created, testing authentication');

sequelize
    .authenticate()
    .then(() => {
        logger.info('Database authentication successful');
    })
    .catch((error) => {
        logger.error(
            {
                message: error.message,
                stack: error.stack,
            },
            'Database authentication failed',
        );
    });

export default sequelize;
