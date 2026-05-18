# Glacier Translate

> Modern AI Translation Web App built for Vietnamese users first.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://translation-snowy.vercel.app/)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

Glacier Translate is a polished translation web app with a Vietnamese-first experience, a futuristic glass UI, and a Node.js translation API that can run locally with Express or deploy cleanly on Vercel Serverless Functions.

🌐 **Live Demo:** [translation-snowy.vercel.app](https://translation-snowy.vercel.app/)

---

## Preview

Glacier Translate ships with a responsive, glassmorphism-inspired interface designed for quick everyday translation.

- Light mode by default, with dark mode available.
- Vietnamese and English interface language switching.
- Same-origin API calls for local and production deployments.
- No screenshot asset is currently included in the repository.

Open the live app here:

👉 **[Launch Glacier Translate](https://translation-snowy.vercel.app/)**

---

## Features

- 🤖 **AI Translation** through the backend translation provider.
- 🇻🇳 **Vietnamese-first UX** with Vietnamese as the default interface language.
- 🌐 **UI language switching** between Tiếng Việt and English.
- ☀️ **Light mode by default** with dark mode support.
- 🕘 **Translation history** stored locally in the browser.
- 🔁 **Language swap** for fast source/target switching.
- 📋 **Copy translation** with one click.
- 📱 **Responsive design** for desktop, tablet, and mobile screens.
- ✨ **Modern futuristic UI** using a Glacier glass style.
- ▲ **Vercel deployment** with Serverless Functions.
- 🧯 **Error handling** for validation and provider failures.
- ⏳ **Loading state** while translation requests are running.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript, Vite |
| Backend | Node.js, Express, ES Modules |
| Translation Provider | Google Translate unofficial provider, mock provider for testing |
| Validation | Custom request validation |
| Logging | Winston, Morgan |
| Security / Middleware | Helmet, CORS, compression, rate limit |
| Deployment | Vercel static output + Serverless Function |

---

## Project Structure

```text
project-root/
  api/
    translate.js              # Vercel Serverless Function
  public/
    index.html                # Glacier UI
    app.js                    # Frontend logic, i18n, API calls
    styles.css                # Responsive visual system
  src/
    app.js                    # Express app for local development
    server.js                 # Local server bootstrap
    config/
    controllers/
    errors/
    logger/
    middlewares/
    providers/
    routes/
    services/
    utils/
    validators/
  scripts/
    deploy-gh-pages.js
  package.json
  vercel.json
  vite.config.js
  README.md
```

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/leminhhuy1122/Translation.git
cd Translation
npm install
```

Requirements:

- Node.js `>=22.12.0`
- npm `>=10.0.0`

---

## Local Development

Run the full local app with Express:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The local Express server serves:

- Frontend: `/`
- Translate API: `/api/translate`
- Health check: `/health`

Useful scripts:

```bash
npm start          # Run Express server
npm run dev        # Run Express server with watch mode
npm run build      # Build frontend for Vercel
npm run lint       # Run ESLint
npm test           # Run tests
```

For frontend-only development:

```bash
npm run dev:frontend
```

---

## Deployment

Glacier Translate is configured for Vercel.

### Deploy With Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Use the default project settings, or configure:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

The deployment is controlled by:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/:path((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

Vercel automatically maps:

```text
api/translate.js -> /api/translate
```

### Environment Variables

The app works with defaults, but these variables can be configured on Vercel:

```text
TRANSLATION_PROVIDER=google_unofficial
TRANSLATION_FALLBACK_PROVIDER=mock
TRANSLATION_TIMEOUT_MS=10000
TRANSLATION_MAX_TEXT_LENGTH=5000
TRANSLATION_GOOGLE_TKK=448487.932609646
TRANSLATION_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
CACHE_ENABLED=false
CACHE_TTL_SECONDS=3600
LOG_LEVEL=info
LOG_FORMAT=json
```

For safe preview testing without calling the real provider:

```text
TRANSLATION_PROVIDER=mock
```

Do not use `mock` in production if you want real translations.

---

## API

### `POST /api/translate`

Translate text from one language to another.

#### Request

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"xin chào\",\"from\":\"vi\",\"to\":\"en\",\"raw\":false}"
```

Body:

```json
{
  "text": "xin chào",
  "from": "vi",
  "to": "en",
  "raw": false
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "text": "hello",
    "from": {
      "language": {
        "didYouMean": false,
        "iso": "vi"
      },
      "text": {
        "autoCorrected": false,
        "value": "",
        "didYouMean": false
      }
    },
    "raw": ""
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Text must be a non-empty string."
  }
}
```

Unsupported methods return:

```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Method not allowed"
  }
}
```

---

## Theme System

Glacier Translate supports both light and dark themes.

- Light mode is the default for first-time visitors.
- Theme preference is saved in `localStorage`.
- Users can switch theme from the top-right control.
- Stored key:

```text
glacier.translate.theme
```

If a user has previously selected dark mode, the app will respect that saved preference.

---

## i18n

The interface currently supports:

- Tiếng Việt
- English

UI copy is defined in `public/app.js`:

```text
translations.vi
translations.en
```

Main i18n helpers:

```text
setUILanguage(lang)
applyTranslations()
getText(key)
```

The selected UI language is saved in:

```text
glacier.translate.uiLanguage
```

---

## Responsive Design

The UI is built to work across common screen sizes:

- Desktop translator layout
- Tablet-friendly panels
- Mobile-first stacking
- Touch-friendly controls
- Responsive history cards

The app avoids separate mobile routes and keeps the translation workflow consistent across devices.

---

## Security & Stability

Glacier Translate keeps deployment and runtime behavior predictable:

- No hardcoded `localhost` in frontend API calls.
- Frontend uses same-origin requests:

```js
fetch('/api/translate', ...)
```

- Request validation prevents empty text and unsupported languages.
- Serverless API returns consistent JSON errors.
- Provider failures are caught and do not crash the app.
- User text is not logged in full; logs only include metadata such as text length.
- Environment values are read from `process.env`.
- Vercel serverless runtime does not write file logs.

---

## Notes

- `dist/` is a generated build folder and is ignored by Git.
- Vercel creates `dist/` automatically during deployment.
- `src/server.js` is for local Express development only.
- `api/translate.js` is the production serverless handler for Vercel.
- `google_unofficial` depends on an unofficial Google Translate endpoint, so rate limits or provider changes can affect real translation behavior.
- `mock` provider is useful for tests and previews, but it does not perform real translation.

---

## License

This project is licensed under the [MIT License](LICENSE).
