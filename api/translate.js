import AppError from '../src/errors/AppError.js';
import logger from '../src/logger/logger.js';
import translationService from '../src/services/translation.service.js';
import { validateTranslatePayload } from '../src/validators/translate.validator.js';

function parseJsonBody(rawBody) {
    if (!rawBody) {
        return {};
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        throw new AppError('Request body must be valid JSON.', 'INVALID_JSON', 400);
    }
}

async function readRequestBody(req) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        return parseJsonBody(req.body.toString('utf8'));
    }

    if (typeof req[Symbol.asyncIterator] !== 'function') {
        return {};
    }

    const chunks = [];

    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }

    return parseJsonBody(Buffer.concat(chunks).toString('utf8'));
}

function logTranslateError(apiLogger, error, requestBody, statusCode, errorCode) {
    const logLevel = statusCode >= 500 ? 'error' : 'warn';

    apiLogger[logLevel]('Vercel translate function failed', {
        statusCode,
        errorCode,
        message: error.message,
        from: typeof requestBody.from === 'string' ? requestBody.from : undefined,
        to: typeof requestBody.to === 'string' ? requestBody.to : undefined,
        textLength: typeof requestBody.text === 'string' ? requestBody.text.length : 0
    });
}

function createTranslateHandler(options = {}) {
    const service = options.translationService || translationService;
    const apiLogger = options.logger || logger;

    return async function handler(req, res) {
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');

            return res.status(405).json({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: 'Method not allowed'
                }
            });
        }

        let requestBody = {};

        try {
            requestBody = await readRequestBody(req);
            const payload = validateTranslatePayload(requestBody);
            const translation = await service.translate(payload);

            return res.status(200).json({
                success: true,
                data: translation
            });
        } catch (error) {
            const isAppError = error instanceof AppError;
            const statusCode = isAppError ? error.statusCode : 500;
            const errorCode = isAppError ? error.code : 'TRANSLATION_FAILED';
            const message = isAppError ? error.message : 'Không thể dịch lúc này';

            logTranslateError(apiLogger, error, requestBody, statusCode, errorCode);

            return res.status(statusCode).json({
                success: false,
                error: {
                    code: errorCode,
                    message
                }
            });
        }
    };
}

const handler = createTranslateHandler();

export { createTranslateHandler, readRequestBody };
export default handler;
