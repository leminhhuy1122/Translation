import env from '../../config/env.js';
import AppError from '../../errors/AppError.js';
import GoogleUnofficialTranslationProvider from './google-unofficial.provider.js';
import MockTranslationProvider from './mock.provider.js';

function createTranslationProvider(providerName = env.translation.provider, options = {}) {
    if (providerName === 'google_unofficial') {
        return new GoogleUnofficialTranslationProvider(options.googleUnofficial);
    }

    if (providerName === 'mock') {
        return new MockTranslationProvider();
    }

    throw new AppError(`Unsupported translation provider: ${providerName}`, 'INVALID_TRANSLATION_PROVIDER', 500);
}

function createFallbackProvider() {
    if (!env.translation.fallbackProvider) {
        return null;
    }

    if (env.translation.fallbackProvider === env.translation.provider) {
        return null;
    }

    return createTranslationProvider(env.translation.fallbackProvider);
}

export { createFallbackProvider, createTranslationProvider };
