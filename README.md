# Translate AI / Glacier Translate

Node.js/Express API dịch thuật kèm frontend tĩnh Glacier Translate trong `public/`. Dự án đã được tách để chạy ổn định theo hai chế độ:

- Local dev: Express server serve cả frontend và API.
- Vercel: frontend được build từ `public/` ra `dist/`, API chạy bằng Serverless Function trong `api/`.

## Yêu Cầu

- Node.js 22.12+
- npm 10+

## Cài Đặt

```bash
npm install
```

## Chạy Local

Chạy full app giống production, frontend và API cùng origin:

```bash
npm run dev
```

Mở:

```text
http://127.0.0.1:3000
```

Test API:

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"xin chào\",\"from\":\"vi\",\"to\":\"en\",\"raw\":false}"
```

Script hữu ích:

```bash
npm start        # chạy Express không watch
npm run lint
npm test
npm run build   # build frontend bằng Vite
```

`npm run dev:frontend` chỉ chạy Vite frontend, dùng khi cần xem UI tĩnh riêng. Luồng khuyến nghị vẫn là `npm run dev` để API `/api/translate` hoạt động cùng frontend.

`npm run build` mặc định build asset ở root `/`, phù hợp với Vercel. Workflow GitHub Pages cũ được giữ ở `npm run build:github` và `npm run deploy`.

## Deploy Lên Vercel

Vercel dùng:

- `api/translate.js` cho `POST /api/translate`.
- `public/` làm source frontend.
- `npm run build` để Vite xuất frontend ra `dist/`.
- `vercel.json` để khai báo build output và fallback về `index.html`.

Các bước:

```bash
npm install
npm run lint
npm test
npm run build
```

Sau đó import repository lên Vercel hoặc chạy Vercel CLI nếu bạn đã cài:

```bash
vercel
vercel --prod
```

Trong Vercel Project Settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Các giá trị này cũng đã có trong `vercel.json`, nên thường không cần cấu hình thủ công.

## Biến Môi Trường

Không hardcode `localhost` hoặc token trong code. Frontend luôn gọi same-origin:

```js
fetch('/api/translate', ...)
```

Biến môi trường có thể cấu hình trên Vercel:

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

Không bắt buộc thêm biến nào nếu dùng mặc định. Nếu muốn test an toàn trên preview, có thể đặt:

```text
TRANSLATION_PROVIDER=mock
```

## API

Endpoint:

```text
POST /api/translate
```

Request:

```json
{
  "text": "xin chào",
  "from": "vi",
  "to": "en",
  "raw": false
}
```

Response thành công:

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

Method khác `POST` trả:

```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Method not allowed"
  }
}
```

## Cấu Trúc

```text
project-root/
  api/
    translate.js
  public/
    index.html
    app.js
    styles.css
  src/
    app.js
    server.js
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

## Ghi Chú Kỹ Thuật

- `src/server.js` có `app.listen()` chỉ dùng cho local dev.
- `api/translate.js` không gọi `app.listen()`, chỉ export default async handler cho Vercel.
- Serverless handler tái sử dụng `validateTranslatePayload()` và `translationService.translate()` từ `src/`.
- Logger không ghi file trong môi trường Vercel serverless.
- Vite mặc định dùng base `/` cho Vercel. Nếu cần base khác, đặt `VITE_BASE_PATH` hoặc dùng `npm run build:github` cho GitHub Pages cũ.

## Kiểm Tra

```bash
npm run lint
npm test
npm run build
```

Sau khi deploy Vercel, kiểm tra:

- Trang `/` load đúng Glacier UI.
- Network request khi bấm dịch là `POST /api/translate`.
- Console không có lỗi `localhost`, CORS hoặc asset path.
- API trả JSON đúng contract hiện tại.

## License

MIT
