import env from '../config/env.js';
import AppError from '../errors/AppError.js';
import { getCode, isSupported } from '../utils/languages.js';

function validateTranslatePayload(payload = {}) {
    const { text, from, to, raw } = payload;

    if (typeof text !== 'string' || text.trim() === '') {
        throw new AppError('Text must be a non-empty string.', 'INVALID_INPUT', 400);
    }

    if (text.length > env.translation.maxTextLength) {
        throw new AppError(
            `Text exceeds maximum supported length (${env.translation.maxTextLength} chars).`,
            'PAYLOAD_TOO_LARGE',
            413
        );
    }

    const fromInput = from || 'auto';
    const toInput = to || 'en';

    if (!isSupported(fromInput)) {
        throw new AppError(`Unsupported source language: ${fromInput}`, 'UNSUPPORTED_LANGUAGE', 400);
    }

    if (!isSupported(toInput)) {
        throw new AppError(`Unsupported target language: ${toInput}`, 'UNSUPPORTED_LANGUAGE', 400);
    }

    return {
        text,
        from: getCode(fromInput),
        to: getCode(toInput),
        raw: Boolean(raw)
    };
}

function validateTranslateRequest(req, _res, next) {
    req.translatePayload = validateTranslatePayload(req.body ?? {});
    next();
}

export { validateTranslatePayload, validateTranslateRequest };
