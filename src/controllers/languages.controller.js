import languages from '../utils/languages.js';

function listLanguages(_req, res) {
    const payload = Object.fromEntries(
        Object.entries(languages).filter(([, value]) => typeof value === 'string')
    );

    res.status(200).json({
        success: true,
        data: payload
    });
}

function getLanguage(req, res) {
    const { code } = req.params;
    const normalizedCode = languages.getCode(code);

    res.status(200).json({
        success: true,
        data: {
            input: code,
            supported: Boolean(normalizedCode),
            code: normalizedCode || null,
            name: normalizedCode ? languages[normalizedCode] : null
        }
    });
}

export { getLanguage, listLanguages };
