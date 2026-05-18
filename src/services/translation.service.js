import env from '../config/env.js';
import AppError from '../errors/AppError.js';
import logger from '../logger/logger.js';
import { createFallbackProvider, createTranslationProvider } from '../providers/translation/index.js';

function getCacheKey(payload) {
    return `${payload.from}::${payload.to}::${payload.raw ? 'raw' : 'parsed'}::${payload.text}`;
}

class TranslationService {
    constructor(options = {}) {
        this.provider = options.provider || createTranslationProvider();
        this.fallbackProvider = options.fallbackProvider ?? createFallbackProvider();
        this.logger = options.logger || logger;
        this.cacheConfig = options.cacheConfig || env.cache;
        this.cache = options.cache || new Map();
    }

    async translate(payload) {
        const start = Date.now();
        const cached = this.getCachedResult(payload);

        if (cached) {
            this.logger.debug('Translation cache hit', {
                provider: this.provider.name,
                from: payload.from,
                to: payload.to,
                textLength: payload.text.length
            });

            return cached;
        }

        try {
            const result = await this.provider.translate(payload);
            this.setCachedResult(payload, result);
            this.logger.info('Translation completed', {
                provider: this.provider.name,
                from: payload.from,
                to: payload.to,
                textLength: payload.text.length,
                durationMs: Date.now() - start
            });

            return result;
        } catch (error) {
            return this.handleProviderError(error, payload, start);
        }
    }

    async handleProviderError(error, payload, start) {
        if (this.fallbackProvider) {
            this.logger.warn('Primary translation provider failed, trying fallback provider', {
                provider: this.provider.name,
                fallbackProvider: this.fallbackProvider.name,
                code: error.code || 'UNKNOWN_ERROR',
                from: payload.from,
                to: payload.to,
                textLength: payload.text.length,
                durationMs: Date.now() - start
            });

            try {
                const fallbackResult = await this.fallbackProvider.translate(payload);
                this.setCachedResult(payload, fallbackResult);

                return fallbackResult;
            } catch (fallbackError) {
                this.logger.error('Fallback translation provider failed', {
                    provider: this.fallbackProvider.name,
                    code: fallbackError.code || 'UNKNOWN_ERROR',
                    message: fallbackError.message,
                    from: payload.from,
                    to: payload.to,
                    textLength: payload.text.length,
                    durationMs: Date.now() - start
                });
            }
        }

        if (error instanceof AppError) {
            this.logger.warn('Translation failed', {
                provider: this.provider.name,
                code: error.code,
                message: error.message,
                from: payload.from,
                to: payload.to,
                textLength: payload.text.length,
                durationMs: Date.now() - start
            });

            throw error;
        }

        this.logger.error('Unexpected translation error', {
            provider: this.provider.name,
            message: error.message,
            stack: error.stack,
            from: payload.from,
            to: payload.to,
            textLength: payload.text.length,
            durationMs: Date.now() - start
        });

        throw new AppError('Unexpected translation error.', 'INTERNAL_ERROR', 500);
    }

    getCachedResult(payload) {
        if (!this.cacheConfig.enabled) {
            return null;
        }

        const cacheKey = getCacheKey(payload);
        const cached = this.cache.get(cacheKey);
        const now = Date.now();

        if (!cached) {
            return null;
        }

        if (cached.expiresAt <= now) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.value;
    }

    setCachedResult(payload, value) {
        if (!this.cacheConfig.enabled) {
            return;
        }

        const now = Date.now();
        const ttlMs = this.cacheConfig.ttlSeconds * 1000;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt <= now) {
                this.cache.delete(key);
            }
        }

        this.cache.set(getCacheKey(payload), {
            value,
            expiresAt: now + ttlMs
        });
    }
}

const translationService = new TranslationService();

export { TranslationService };
export default translationService;
