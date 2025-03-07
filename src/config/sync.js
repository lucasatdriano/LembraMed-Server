import sequelize from './db';

const syncDatabase = async () => {
    try {
        await sequelize
            .sync({ force: false })
            .then(() => {
                console.log('Modelos sincronizados com sucesso.');
            })
            .catch((error) => {
                console.error('Erro ao sincronizar os modelos: ', error);
            });
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados: ', error);
    }
};
