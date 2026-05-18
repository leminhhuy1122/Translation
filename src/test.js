import assert from 'node:assert/strict';
import test from 'node:test';
import { createTranslateHandler } from '../api/translate.js';
import { createApp } from './app.js';
import AppError from './errors/AppError.js';
import translate, { buildTranslateUrl, generateToken, parseTranslateResponse } from './index.js';
import MockTranslationProvider from './providers/translation/mock.provider.js';
import TranslationProvider from './providers/translation/base.provider.js';
import { TranslationService } from './services/translation.service.js';
import languages from './utils/languages.js';
import { validateTranslatePayload } from './validators/translate.validator.js';

const silentLogger = {
    debug() {},
    error() {},
    info() {},
    warn() {},
    stream: {
        write() {}
    }
};

const noRateLimit = (_req, _res, next) => next();

class FailingProvider extends TranslationProvider {
    constructor() {
        super('failing');
    }

    async translate() {
        throw new AppError('Provider failed.', 'PROVIDER_FAILED', 502);
    }
}

function createMockService(options = {}) {
    return new TranslationService({
        provider: options.provider || new MockTranslationProvider(),
        fallbackProvider: options.fallbackProvider ?? null,
        logger: silentLogger,
        cacheConfig: {
            enabled: false,
            ttlSeconds: 0
        }
    });
}

function listen(app) {
    return new Promise((resolve) => {
        const server = app.listen(0, () => {
            resolve(server);
        });
    });
}

async function postJson(server, path, body) {
    const { port } = server.address();

    return fetch(`http://127.0.0.1:${port}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function createMockResponse() {
    return {
        body: null,
        headers: new Map(),
        statusCode: 200,
        setHeader(name, value) {
            this.headers.set(name.toLowerCase(), value);
            return this;
        },
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('languages lookup supports code and name', () => {
    assert.equal(languages.isSupported('en'), true);
    assert.equal(languages.isSupported('English'), true);
    assert.equal(languages.getCode('english'), 'en');
    assert.equal(languages.getCode('xx'), false);
});

test('token generation returns expected shape', () => {
    const token = generateToken('hello');
    assert.match(token, /^\d+\.\d+$/);
});

test('buildTranslateUrl includes required query params', () => {
    const url = buildTranslateUrl('hello', { from: 'en', to: 'es' });
    assert.match(url, /^https:\/\/translate\.google\.com\/translate_a\/single\?/);
    assert.match(url, /[?&]sl=en/);
    assert.match(url, /[?&]tl=es/);
    assert.match(url, /[?&]q=hello/);
});

test('parseTranslateResponse safely parses valid response', () => {
    const responseText = JSON.stringify([
        [['hola', 'hello', null, null, 10]],
        null,
        'en',
        null,
        null,
        null,
        null,
        ['<b><i>hello</i></b>', null, null, null, null, true],
        [['en']]
    ]);

    const parsed = parseTranslateResponse(responseText, false);

    assert.equal(parsed.text, 'hola');
    assert.equal(parsed.from.language.iso, 'en');
    assert.equal(parsed.from.text.autoCorrected, true);
    assert.equal(parsed.from.text.value, '[hello]');
    assert.equal(parsed.raw, '');
});

test('parseTranslateResponse throws AppError on invalid JSON', () => {
    assert.throws(
        () => parseTranslateResponse('not-json', false),
        (error) => error instanceof AppError && error.code === 'PARSE_ERROR'
    );
});

test('translate input validation fails before provider call', async () => {
    await assert.rejects(
        () => translate('', {}),
        (error) => error instanceof AppError && error.code === 'INVALID_INPUT'
    );

    await assert.rejects(
        () => translate('hello', { to: 'invalid-language' }),
        (error) => error instanceof AppError && error.code === 'UNSUPPORTED_LANGUAGE'
    );
});

test('translation service returns result for valid payload', async () => {
    const service = createMockService();
    const payload = validateTranslatePayload({ text: 'hello', from: 'en', to: 'vi' });
    const result = await service.translate(payload);

    assert.equal(result.text, '[mock:vi] hello');
    assert.equal(result.from.language.iso, 'en');
});

test('POST /api/translate returns translation for a valid request', async (t) => {
    const app = createApp({
        translationService: createMockService(),
        logger: silentLogger,
        rateLimiter: noRateLimit
    });
    const server = await listen(app);
    t.after(() => server.close());

    const response = await postJson(server, '/api/translate', {
        text: 'hello',
        from: 'en',
        to: 'vi'
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.text, '[mock:vi] hello');
});

test('POST /api/translate returns validation error when text is missing', async (t) => {
    const app = createApp({
        translationService: createMockService(),
        logger: silentLogger,
        rateLimiter: noRateLimit
    });
    const server = await listen(app);
    t.after(() => server.close());

    const response = await postJson(server, '/api/translate', {
        from: 'en',
        to: 'vi'
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_INPUT');
});

test('POST /api/translate returns provider error without crashing app', async (t) => {
    const app = createApp({
        translationService: createMockService({
            provider: new FailingProvider()
        }),
        logger: silentLogger,
        rateLimiter: noRateLimit
    });
    const server = await listen(app);
    t.after(() => server.close());

    const response = await postJson(server, '/api/translate', {
        text: 'hello',
        from: 'en',
        to: 'vi'
    });
    const body = await response.json();

    assert.equal(response.status, 502);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'PROVIDER_FAILED');
});

test('Vercel translate handler returns translation for a valid POST request', async () => {
    const handler = createTranslateHandler({
        translationService: createMockService(),
        logger: silentLogger
    });
    const response = createMockResponse();

    await handler({
        method: 'POST',
        body: {
            text: 'hello',
            from: 'en',
            to: 'vi',
            raw: false
        }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.text, '[mock:vi] hello');
});

test('Vercel translate handler rejects non-POST requests', async () => {
    const handler = createTranslateHandler({
        translationService: createMockService(),
        logger: silentLogger
    });
    const response = createMockResponse();

    await handler({ method: 'GET', body: {} }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.get('allow'), 'POST');
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'METHOD_NOT_ALLOWED');
});

test('translation service can fall back to a secondary provider', async () => {
    const service = createMockService({
        provider: new FailingProvider(),
        fallbackProvider: new MockTranslationProvider()
    });
    const payload = validateTranslatePayload({ text: 'hello', from: 'en', to: 'vi' });
    const result = await service.translate(payload);

    assert.equal(result.text, '[mock:vi] hello');
});
