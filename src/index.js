import translationService from './services/translation.service.js';
import languages from './utils/languages.js';
import { validateTranslatePayload } from './validators/translate.validator.js';
import {
    buildTranslateUrl,
    generateToken,
    parseTranslateResponse
} from './providers/translation/google-unofficial.provider.js';

async function translate(text, options = {}) {
    const payload = validateTranslatePayload({
        ...options,
        text
    });

    return translationService.translate(payload);
}

translate.languages = languages;

export { buildTranslateUrl, generateToken, parseTranslateResponse };
export { languages };
export default translate;
