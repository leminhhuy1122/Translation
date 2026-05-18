import AppError from '../errors/AppError.js';
import env from '../config/env.js';

function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route not found: ${req.method} ${req.originalUrl}`
        }
    });
}

function errorHandler(err, req, res, _next) {
    const logger = req.app?.get('logger');
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_ERROR';

    if (logger) {
        logger.error('Request failed', {
            method: req.method,
            url: req.originalUrl,
            statusCode,
            errorCode,
            message: err.message,
            stack: env.isProduction ? undefined : err.stack
        });
    }

    if (err instanceof AppError) {
        return res.status(statusCode).json({
            success: false,
            error: {
                code: errorCode,
                message: err.message
            }
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: env.isProduction ? 'Internal server error' : err.message
        }
    });
}

export { errorHandler, notFoundHandler };
