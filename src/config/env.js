import { config as loadDotenv } from 'dotenv';

loadDotenv();

function toInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function toBool(value, fallback = false) {
    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
        return true;
    }

    if (normalized === 'false') {
        return false;
    }

    return fallback;
}

const providerName = process.env.TRANSLATION_PROVIDER || 'google_unofficial';
const fallbackProviderName = process.env.TRANSLATION_FALLBACK_PROVIDER || '';
const supportedProviders = new Set(['google_unofficial', 'mock']);

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    server: {
        host: process.env.HOST || '0.0.0.0',
        port: toInt(process.env.PORT, 3000)
    },
    logging: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        format: process.env.LOG_FORMAT || 'json'
    },
    translation: {
        provider: providerName,
        fallbackProvider: fallbackProviderName,
        timeoutMs: toInt(process.env.TRANSLATION_TIMEOUT_MS || process.env.TRANSLATE_TIMEOUT, 10000),
        maxTextLength: toInt(process.env.TRANSLATION_MAX_TEXT_LENGTH, 5000),
        googleUnofficial: {
            tkk:
                process.env.TRANSLATION_GOOGLE_TKK ||
                process.env.TRANSLATE_TKK ||
                process.env.TRANSLATE_TK ||
                '448487.932609646',
            userAgent:
                process.env.TRANSLATION_USER_AGENT ||
                process.env.USER_AGENT ||
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    },
    rateLimit: {
        maxRequests: toInt(process.env.RATE_LIMIT_MAX, 100),
        windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW, 60000)
    },
    cache: {
        enabled: toBool(process.env.CACHE_ENABLED, false),
        ttlSeconds: toInt(process.env.CACHE_TTL_SECONDS || process.env.CACHE_TTL, 3600)
    }
};

function validateEnv(runtimeEnv) {
    if (runtimeEnv.server.port < 1 || runtimeEnv.server.port > 65535) {
        throw new Error('PORT must be between 1 and 65535.');
    }

    if (runtimeEnv.translation.timeoutMs < 1000) {
        throw new Error('TRANSLATION_TIMEOUT_MS must be at least 1000 ms.');
    }

    if (runtimeEnv.translation.maxTextLength < 1) {
        throw new Error('TRANSLATION_MAX_TEXT_LENGTH must be at least 1.');
    }

    if (!supportedProviders.has(runtimeEnv.translation.provider)) {
        throw new Error(`Unsupported TRANSLATION_PROVIDER: ${runtimeEnv.translation.provider}`);
    }

    if (
        runtimeEnv.translation.fallbackProvider &&
        !supportedProviders.has(runtimeEnv.translation.fallbackProvider)
    ) {
        throw new Error(`Unsupported TRANSLATION_FALLBACK_PROVIDER: ${runtimeEnv.translation.fallbackProvider}`);
    }

    if (runtimeEnv.rateLimit.maxRequests < 1) {
        throw new Error('RATE_LIMIT_MAX must be at least 1.');
    }

    if (runtimeEnv.rateLimit.windowMs < 1000) {
        throw new Error('RATE_LIMIT_WINDOW_MS must be at least 1000 ms.');
    }
}

validateEnv(env);

export { supportedProviders, toBool, toInt };
export default env;
