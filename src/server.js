import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';

import { setupSwagger } from './config/swagger.js';
import syncDatabase from './config/sync.js';
import sequelize from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📨 [DEBUG REQUEST] ${req.method} ${req.url}`, {
        body: req.body,
        headers: req.headers,
    });
    next();
});

app.use(
    cors({
        origin: function (origin, callback) {
            console.log(`🔍 [DEBUG CORS] Origin recebida: ${origin}`);
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3001',
                'https://seu-frontend-production.com',
            ];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                console.log('✅ [DEBUG CORS] Origin permitida');
                callback(null, true);
            } else {
                console.log('❌ [DEBUG CORS] Origin bloqueada:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

console.log('🔍 [DEBUG APP] Configurando dotenv...');
dotenv.config();

console.log('🔍 [DEBUG APP] Configurando rotas...');
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/notifications', notificationRoutes);
app.use('/contacts', contactRoutes);
app.use('/medications', medicationRoutes);

app.get('/health', (req, res) => {
    console.log('🔍 [DEBUG HEALTH] Health check chamado');
    res.json({
        status: 'OK',
        message: 'Servidor rodando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

console.log('🔍 [DEBUG APP] Configurando Swagger...');
setupSwagger(app);

console.log('🔍 [DEBUG APP] Chamando syncDatabase...');
syncDatabase();

const PORT = process.env.PORT || 3000;
console.log(`🔍 [DEBUG APP] Iniciando servidor na porta ${PORT}...`);

app.listen(PORT, async () => {
    try {
        console.log('🔄 [DEBUG APP] Testando conexão com banco no listener...');
        await sequelize.authenticate();
        console.log('✅ [DEBUG APP] Conectado ao banco de dados com sucesso!');
        console.log(
            '🚀 [DEBUG APP] Servidor rodando em https://lembramed-server.onrender.com',
        );
        console.log(
            '📄 [DEBUG APP] Documentação Swagger: https://lembramed-server.onrender.com/api-docs',
        );
        console.log(
            '🔍 [DEBUG APP] Health check disponível em: http://localhost:' +
                PORT +
                '/health',
        );
    } catch (err) {
        console.error(
            '❌ [DEBUG APP] Erro ao conectar ao banco de dados: ',
            err,
        );
        console.log('🔍 [DEBUG APP] Detalhes do erro:', err.message);
        console.log('🔍 [DEBUG APP] Stack trace:', err.stack);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [DEBUG UNHANDLED] Rejeição não tratada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ [DEBUG UNCAUGHT] Exceção não capturada:', error);
});
