import TranslationProvider from './base.provider.js';

class MockTranslationProvider extends TranslationProvider {
    constructor() {
        super('mock');
    }

    async translate(payload) {
        const detectedLanguage = payload.from === 'auto' ? 'en' : payload.from;
        const response = {
            text: `[mock:${payload.to}] ${payload.text}`,
            from: {
                language: {
                    didYouMean: false,
                    iso: detectedLanguage
                },
                text: {
                    autoCorrected: false,
                    value: '',
                    didYouMean: false
                }
            },
            raw: ''
        };

        if (payload.raw) {
            response.raw = JSON.stringify({
                provider: this.name,
                text: response.text,
                from: detectedLanguage,
                to: payload.to
            });
        }

        return response;
    }
}

export default MockTranslationProvider;
