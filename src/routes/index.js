import { Router } from 'express';
import languagesRoutes from './languages.routes.js';
import { createTranslateRoutes } from './translate.routes.js';

function createApiRouter(options = {}) {
    const router = Router();

    router.use(createTranslateRoutes(options));
    router.use(languagesRoutes);

    return router;
}

const apiRouter = createApiRouter();

export { createApiRouter };
export default apiRouter;
