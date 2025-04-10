import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';

import { setupSwagger } from './config/swagger.js';
import syncDatabase from './config/sync.js';
import sequelize from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/contacts', contactRoutes);
app.use('/medications', medicationRoutes);

setupSwagger(app);
syncDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('🛜  Conectado ao banco de dados com sucesso!');
        console.log(
            '🚀 Servidor rodando em https://lembramed-server.onrender.com',
        );
        console.log(
            '📄 Documentação Swagger: https://lembramed-server.onrender.com/api-docs',
        );
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados: ', err);
    }
});
