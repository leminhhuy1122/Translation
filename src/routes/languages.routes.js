import { Router } from 'express';
import { getLanguage, listLanguages } from '../controllers/languages.controller.js';

const languagesRoutes = Router();

languagesRoutes.get('/languages', listLanguages);
languagesRoutes.get('/languages/:code', getLanguage);

export default languagesRoutes;
