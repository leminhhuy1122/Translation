import https from 'node:https';
import { URLSearchParams } from 'node:url';
import env from '../../config/env.js';
import AppError from '../../errors/AppError.js';
import TranslationProvider from './base.provider.js';

function bitwiseTransform(value, pattern) {
    let current = value;

    for (let i = 0; i < pattern.length - 2; i += 3) {
        let shift = pattern.charAt(i + 2);
        shift = shift >= 'a' ? shift.charCodeAt(0) - 87 : Number(shift);
        shift = pattern.charAt(i + 1) === '+' ? current >>> shift : current << shift;
        current = pattern.charAt(i) === '+' ? (current + shift) & 4294967295 : current ^ shift;
    }

    return current;
}

function generateToken(text, tkk = env.translation.googleUnofficial.tkk) {
    const [firstPart, secondPart] = tkk.split('.');
    const seed = Number(firstPart) || 0;

    const bytes = [];
    for (let i = 0; i < text.length; i += 1) {
        let codePoint = text.charCodeAt(i);

        if (codePoint < 128) {
            bytes.push(codePoint);
        } else {
            if (codePoint < 2048) {
                bytes.push((codePoint >> 6) | 192);
            } else {
                const isSurrogatePair =
                    (codePoint & 64512) === 55296 &&
                    i + 1 < text.length &&
                    (text.charCodeAt(i + 1) & 64512) === 56320;

                if (isSurrogatePair) {
                    codePoint = 65536 + ((codePoint & 1023) << 10) + (text.charCodeAt(i + 1) & 1023);
                    i += 1;
                    bytes.push((codePoint >> 18) | 240);
                    bytes.push(((codePoint >> 12) & 63) | 128);
                } else {
                    bytes.push((codePoint >> 12) | 224);
                }

                bytes.push(((codePoint >> 6) & 63) | 128);
            }

            bytes.push((codePoint & 63) | 128);
        }
    }

    let accumulator = seed;

    for (const currentByte of bytes) {
        accumulator += currentByte;
        accumulator = bitwiseTransform(accumulator, '+-a^+6');
    }

    accumulator = bitwiseTransform(accumulator, '+-3^+b+-f');
    accumulator ^= Number(secondPart) || 0;

    if (accumulator < 0) {
        accumulator = (accumulator & 2147483647) + 2147483648;
    }

    accumulator %= 1e6;

    return `${accumulator}.${accumulator ^ seed}`;
}

function buildTranslateUrl(text, options) {
    const tkk = options.tkk || env.translation.googleUnofficial.tkk;
    const params = new URLSearchParams({
        client: 't',
        sl: options.from,
        tl: options.to,
        hl: options.to,
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: '1',
        ssel: '0',
        tsel: '0',
        kc: '7',
        tk: generateToken(text, tkk),
        q: text
    });

    const detailModes = ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'];
    for (const mode of detailModes) {
        params.append('dt', mode);
    }

    return `https://translate.google.com/translate_a/single?${params.toString()}`;
}

function parseTranslateResponse(responseText, includeRaw) {
    let parsed;

    try {
        parsed = JSON.parse(responseText);
    } catch {
        throw new AppError('Failed to parse translation response.', 'PARSE_ERROR', 502);
    }

    const result = {
        text: '',
        from: {
            language: {
                didYouMean: false,
                iso: ''
            },
            text: {
                autoCorrected: false,
                value: '',
                didYouMean: false
            }
        },
        raw: includeRaw ? responseText : ''
    };

    if (Array.isArray(parsed[0])) {
        for (const segment of parsed[0]) {
            if (Array.isArray(segment) && segment[0]) {
                result.text += segment[0];
            }
        }
    }

    const detectedLanguage = parsed[2];
    const suggestedLanguage = parsed?.[8]?.[0]?.[0];

    if (detectedLanguage && detectedLanguage === suggestedLanguage) {
        result.from.language.iso = detectedLanguage;
    } else {
        result.from.language.didYouMean = Boolean(suggestedLanguage);
        result.from.language.iso = suggestedLanguage || detectedLanguage || '';
    }

    if (parsed[7]?.[0]) {
        const corrected = parsed[7][0]
            .replaceAll('<b><i>', '[')
            .replaceAll('</i></b>', ']');

        result.from.text.value = corrected;
        if (parsed[7][5] === true) {
            result.from.text.autoCorrected = true;
        } else {
            result.from.text.didYouMean = true;
        }
    }

    return result;
}

class GoogleUnofficialTranslationProvider extends TranslationProvider {
    constructor(options = {}) {
        super('google_unofficial');
        this.timeoutMs = options.timeoutMs || env.translation.timeoutMs;
        this.tkk = options.tkk || env.translation.googleUnofficial.tkk;
        this.userAgent = options.userAgent || env.translation.googleUnofficial.userAgent;
        this.agent = new https.Agent({
            keepAlive: true,
            maxSockets: 100,
            timeout: this.timeoutMs
        });
    }

    async translate(payload) {
        const url = buildTranslateUrl(payload.text, {
            from: payload.from,
            to: payload.to,
            tkk: this.tkk
        });
        const providerResponse = await this.requestTranslation(url);

        return parseTranslateResponse(providerResponse, payload.raw);
    }

    requestTranslation(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(
                url,
                {
                    agent: this.agent,
                    headers: {
                        'User-Agent': this.userAgent
                    }
                },
                (response) => {
                    let body = '';

                    response.setEncoding('utf8');
                    response.on('data', (chunk) => {
                        body += chunk;
                    });

                    response.on('end', () => {
                        if (response.statusCode !== 200) {
                            reject(new AppError('Translation provider rejected the request.', 'BAD_REQUEST', 502));
                            return;
                        }

                        resolve(body);
                    });
                }
            );

            request.setTimeout(this.timeoutMs, () => {
                request.destroy(new AppError('Translation request timed out.', 'TIMEOUT', 504));
            });

            request.on('error', (error) => {
                if (error instanceof AppError) {
                    reject(error);
                    return;
                }

                reject(new AppError('Network error calling translation provider.', 'BAD_NETWORK', 502));
            });
        });
    }
}

export { buildTranslateUrl, generateToken, parseTranslateResponse };
export default GoogleUnofficialTranslationProvider;
