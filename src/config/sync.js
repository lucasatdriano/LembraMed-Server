import sequelize from './db.js';

const syncDatabase = async () => {
    try {
        console.log('🔄 [DEBUG SYNC] Iniciando sincronização do banco...');

        await sequelize
            .sync({ force: false })
            .then(() => {
                console.log(
                    '✅ [DEBUG SYNC] Modelos sincronizados com sucesso.',
                );
            })
            .catch((error) => {
                console.error(
                    '❌ [DEBUG SYNC] Erro ao sincronizar os modelos: ',
                    error,
                );
                console.log(
                    '🔍 [DEBUG SYNC] Tipo do erro:',
                    error.constructor.name,
                );
                console.log(
                    '🔍 [DEBUG SYNC] Mensagem completa:',
                    error.message,
                );

                if (error.original) {
                    console.log(
                        '🔍 [DEBUG SYNC] Erro original:',
                        error.original.message,
                    );
                }
            });
    } catch (error) {
        console.error('❌ [DEBUG SYNC] Erro no bloco try-catch: ', error);
        console.log('🔍 [DEBUG SYNC] Stack trace completo:', error.stack);
    }
};

console.log('🔍 [DEBUG SYNC] Arquivo syncDatabase carregado');

export default syncDatabase;
