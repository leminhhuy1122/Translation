import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import AppError from '../errors/AppError.js';

function createRateLimitMiddleware(options = {}) {
    return rateLimit({
        windowMs: options.windowMs || env.rateLimit.windowMs,
        max: options.maxRequests || env.rateLimit.maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, _res, next) => {
            next(new AppError('Rate limit exceeded, please retry later.', 'RATE_LIMITED', 429));
        }
    });
}

const apiRateLimiter = createRateLimitMiddleware();

export { createRateLimitMiddleware };
export default apiRateLimiter;
