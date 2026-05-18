import translationService from '../services/translation.service.js';

function createTranslateController(options = {}) {
    const service = options.translationService || translationService;

    return {
        translateText: async (req, res) => {
            const translation = await service.translate(req.translatePayload);

            res.status(200).json({
                success: true,
                data: translation
            });
        }
    };
}

const translateController = createTranslateController();

export { createTranslateController };
export default translateController;
