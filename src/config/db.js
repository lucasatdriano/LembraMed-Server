import { Sequelize } from 'sequelize';

console.log('🔍 [DEBUG DB] Variáveis de ambiente carregadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_DIALECT:', process.env.DB_DIALECT);

const isProduction = process.env.NODE_ENV === 'production';
const isUsingRenderDB =
    process.env.DB_HOST && process.env.DB_HOST.includes('render.com');

console.log('isProduction:', isProduction);
console.log('isUsingRenderDB:', isUsingRenderDB);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        logging: (sql) => {
            console.log('🔍 [DEBUG SQL]:', sql);
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

console.log('🔍 [DEBUG DB] Conexão Sequelize criada, testando autenticação...');

sequelize
    .authenticate()
    .then(() => {
        console.log('✅ [DEBUG DB] Autenticação bem-sucedida!');
    })
    .catch((error) => {
        console.error('❌ [DEBUG DB] Erro na autenticação:', error.message);
        console.log('🔍 [DEBUG DB] Stack trace:', error.stack);
    });

export default sequelize;
