import { Router } from 'express';
import { createTranslateController } from '../controllers/translate.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateTranslateRequest } from '../validators/translate.validator.js';

function createTranslateRoutes(options = {}) {
    const router = Router();
    const controller = createTranslateController(options);

    router.post('/translate', validateTranslateRequest, asyncHandler(controller.translateText));

    return router;
}

const translateRoutes = createTranslateRoutes();

export { createTranslateRoutes };
export default translateRoutes;
