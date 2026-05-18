import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import env from '../config/env.js';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const sharedFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
);

const logger = winston.createLogger({
    level: env.logging.level,
    defaultMeta: {
        service: 'translate-api',
        environment: env.nodeEnv
    },
    format: env.logging.format === 'json'
        ? winston.format.combine(sharedFormat, winston.format.json())
        : winston.format.combine(
            sharedFormat,
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const suffix = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level}: ${message}${suffix}`;
            })
        ),
    transports: [
        new winston.transports.Console({
            format: env.isProduction
                ? winston.format.combine(sharedFormat, winston.format.json())
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
        })
    ]
});

if (env.isProduction) {
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5
    }));

    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5
    }));
}

logger.stream = {
    write: (line) => {
        logger.info(line.trim());
    }
};

export default logger;
