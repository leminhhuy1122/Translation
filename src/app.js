import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import apiRateLimiter from './middlewares/rate-limit.middleware.js';
import { createApiRouter } from './routes/index.js';
import logger from './logger/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

function createApp(options = {}) {
    const appLogger = options.logger || logger;
    const app = express();

    app.set('trust proxy', 1);
    app.set('logger', appLogger);

    app.use(helmet());
    app.use(compression());
    app.use(cors({ origin: true, credentials: false }));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: false, limit: '1mb' }));
    app.use(morgan('combined', { stream: appLogger.stream }));

    app.use(express.static(publicDir));
    app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            service: 'translate-api',
            version: '3.0.0',
            environment: env.nodeEnv,
            uptime: process.uptime()
        });
    });

    app.use('/api', options.rateLimiter || apiRateLimiter, createApiRouter(options));

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

const app = createApp();

export { createApp };
export default app;
