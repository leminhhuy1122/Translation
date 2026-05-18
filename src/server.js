import { pathToFileURL } from 'node:url';
import app from './app.js';
import env from './config/env.js';
import logger from './logger/logger.js';

function startServer() {
    const server = app.listen(env.server.port, env.server.host, () => {
        logger.info('HTTP server started', {
            host: env.server.host,
            port: env.server.port,
            environment: env.nodeEnv,
            provider: env.translation.provider
        });
    });

    const shutdown = (signal) => {
        logger.info('Received shutdown signal', { signal });
        server.close(() => {
            logger.info('HTTP server closed cleanly');
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    startServer();
}

export { app, startServer };
export default app;
