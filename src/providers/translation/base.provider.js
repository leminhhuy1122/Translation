import AppError from '../../errors/AppError.js';

class TranslationProvider {
    constructor(name) {
        this.name = name;
    }

    async translate() {
        throw new AppError('Translation provider has not implemented translate().', 'PROVIDER_NOT_IMPLEMENTED', 500);
    }
}

export default TranslationProvider;
