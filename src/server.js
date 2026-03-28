import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { logger } from './utils/logger.js';
import { setupSwagger } from './config/swagger.js';
import syncDatabase from './config/sync.js';
import sequelize from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import deviceRoutes from './routes/device.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import contactRoutes from './routes/contact.routes.js';
import medicationRoutes from './routes/medication.routes.js';

import { TokenService } from './services/auth/token.service.js';
import { dateTime } from './utils/formatters/date-time.js';
import { errorHandler } from './middleware/error.middleware.js';
import medicationScheduler from './services/scheduler/medication.scheduler.js';

const app = express();

const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://lembramed.vercel.app',
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            logger.warn({ origin }, 'Blocked by CORS');
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/notifications', notificationRoutes);
app.use('/contacts', contactRoutes);
app.use('/medications', medicationRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: dateTime.now().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

setupSwagger(app);

app.use(errorHandler);

async function startServer() {
    try {
        logger.info('Starting server...');

        await syncDatabase();

        await sequelize.authenticate();

        medicationScheduler.init();

        startTokenCleanup();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            logger.info({ port: PORT }, 'Server running');
        });
    } catch (error) {
        logger.error(
            {
                message: error.message,
                stack: error.stack,
            },
            'Server startup failed',
        );

        process.exit(1);
    }
}

function startTokenCleanup() {
    TokenService.cleanupExpiredTokens();

    setInterval(
        () => {
            logger.info('Running token cleanup job');

            TokenService.cleanupExpiredTokens();
        },
        60 * 60 * 1000,
    );
}

startServer();
