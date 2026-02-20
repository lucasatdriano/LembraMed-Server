import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';

import { setupSwagger } from './config/swagger.js';
import syncDatabase from './config/sync.js';
import sequelize from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import deviceRoutes from './routes/device.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import contactRoutes from './routes/contact.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import { TokenService } from './services/token.service.js';
import medicationScheduler from './services/medication-scheduler.service.js';
import { timezone } from './utils/formatters/timezone.js';

const app = express();

dotenv.config();

app.use(
    cors({
        origin: function (origin, callback) {
            console.log(`🔍 [DEBUG CORS] Origin recebida: ${origin}`);
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3001',
                'http://127.0.0.1:3000',
                'https://seu-frontend-production.com',
            ];

            if (!origin) {
                console.log('✅ [DEBUG CORS] Request sem origin - permitido');
                return callback(null, true);
            }

            if (allowedOrigins.indexOf(origin) !== -1) {
                console.log('✅ [DEBUG CORS] Origin permitida:', origin);
                callback(null, true);
            } else {
                console.log('❌ [DEBUG CORS] Origin bloqueada:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
    }),
);

app.use((req, res, next) => {
    console.log(`📨 [DEBUG REQUEST] ${req.method} ${req.url}`, {
        body: req.body,
        headers: req.headers,
    });
    next();
});

app.use(express.json());

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
        timestamp: timezone.now().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-device-id',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
});

console.log('🔍 [DEBUG APP] Configurando Swagger...');
setupSwagger(app);

async function startServer() {
    try {
        console.log('🔍 [DEBUG APP] Chamando syncDatabase...');
        await syncDatabase();

        console.log(
            '🔍 [DEBUG APP] Inicializando scheduler de medicamentos...',
        );
        medicationScheduler.init();

        const PORT = process.env.PORT || 3000;
        console.log(`🔍 [DEBUG APP] Iniciando servidor na porta ${PORT}...`);

        app.listen(PORT, async () => {
            try {
                console.log(
                    '🔄 [DEBUG APP] Testando conexão com banco no listener...',
                );
                await sequelize.authenticate();
                console.log(
                    '✅ [DEBUG APP] Conectado ao banco de dados com sucesso!',
                );

                startTokenCleanup();

                console.log('🚀 [DEBUG APP] Servidor rodando na porta', PORT);
                console.log(
                    '🔐 [AUTH SYSTEM] Sistema de login infinito configurado',
                );
                console.log('   - Access Token: 1 dias');
                console.log('   - Refresh Token: 7 dias');
                console.log('   - Auto-refresh: Habilitado');
                console.log('   - Cleanup: A cada 1 hora');
            } catch (err) {
                console.error(
                    '❌ [DEBUG APP] Erro ao conectar ao banco de dados: ',
                    err,
                );
            }
        });
    } catch (error) {
        console.error('❌ [DEBUG APP] Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

const startTokenCleanup = () => {
    TokenService.cleanupExpiredTokens();

    setInterval(
        () => {
            console.log(
                '🔄 [TOKEN CLEANUP] Iniciando limpeza de tokens expirados...',
            );
            TokenService.cleanupExpiredTokens();
        },
        60 * 60 * 1000,
    );

    console.log('✅ [TOKEN CLEANUP] Agendamento de limpeza configurado');
};

startServer();
