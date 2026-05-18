# Translate AI / Glacier Translate

## Chạy Và Deploy

Yêu cầu:

- Node.js 22+
- npm 10+

Cài dependency:

```bash
npm install
```

Chạy frontend bằng Vite:

```bash
npm run dev
```

Build ra thư mục `dist/`:

```bash
npm run build
```

Deploy lên GitHub Pages:

```bash
npm run deploy
```

GitHub Pages URL:

```text
https://leminhhuy1122.github.io/Translation/
```

Chạy backend Express local:

```bash
npm run dev:server
```

Kiểm tra code:

```bash
npm run lint
npm test
```

## GitHub Pages / Vite

Dự án đã được cấu hình deploy đúng chuẩn GitHub Pages bằng Vite:

- Build bằng Vite.
- Deploy thư mục `dist/`.
- `base` đã đặt đúng repo: `/Translation/`.
- Script deploy dùng `gh-pages`.
- Asset CSS/JS được Vite hash và tự trỏ đúng `/Translation/assets/...`.

File cấu hình:

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'public',
    base: '/Translation/',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
});
```

Script trong `package.json`:

```json
{
  "dev": "vite --host 0.0.0.0",
  "dev:server": "node --watch src/server.js",
  "build": "vite build",
  "preview": "vite preview --host 0.0.0.0",
  "deploy": "npm run build && gh-pages -d dist"
}
```

## Lưu Ý Quan Trọng Về API

GitHub Pages chỉ host frontend tĩnh, không chạy được backend Node.js.

Frontend hiện gọi:

```text
/api/translate
```

Khi chạy chung với Express local thì API hoạt động bình thường. Khi deploy lên GitHub Pages, bạn cần deploy backend ở một nơi khác rồi cấu hình biến Vite:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com npm run build
```

Nếu không cấu hình backend public, giao diện trên GitHub Pages vẫn hiển thị đúng nhưng chức năng dịch thật sẽ không gọi được API.

## Tóm Tắt Dự Án

Đây là Node.js API server dùng ES Modules, runtime Node.js 22+, có frontend tĩnh trong `public/`.

Backend cung cấp API:

- `GET /health`
- `POST /api/translate`
- `GET /api/languages`
- `GET /api/languages/:code`

Frontend Glacier dùng:

- `public/index.html`
- `public/styles.css`
- `public/app.js`

## Những Gì Đã Thay Đổi

### 1. Đưa `index.html` Về Lại `public/`

Theo yêu cầu mới nhất, `index.html` đã được chuyển lại vào:

```text
public/index.html
```

Đường dẫn asset trong HTML đã được sửa để Vite xử lý:

```html
<link rel="stylesheet" href="./styles.css" />
<script type="module" src="./app.js"></script>
```

### 2. Refactor Backend

Backend đã được tách theo layer rõ ràng:

- `src/app.js`: tạo Express app, middleware, route.
- `src/server.js`: bootstrap server và graceful shutdown.
- `src/routes/`: định nghĩa route.
- `src/controllers/`: nhận request và trả response.
- `src/services/translation.service.js`: xử lý flow dịch, cache, fallback, logging.
- `src/providers/translation/`: chứa các provider dịch.
- `src/config/env.js`: đọc và validate env.
- `src/middlewares/`: error handler, rate limit.
- `src/errors/AppError.js`: chuẩn hóa lỗi.
- `src/logger/logger.js`: Winston logger.

### 3. Tách Translation Provider

Logic gọi Google Translate unofficial đã được đóng gói riêng:

```text
src/providers/translation/google-unofficial.provider.js
```

Provider hiện có:

- `google_unofficial`: provider mặc định.
- `mock`: provider giả lập cho test/dev/fallback.

Sau này có thể thêm Google Cloud Translate, DeepL hoặc LibreTranslate mà không cần sửa controller/route.

### 4. Error Handling An Toàn Hơn

Nếu provider lỗi, timeout hoặc Google đổi response/token, app không crash. API trả lỗi thống nhất:

```json
{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Backend không log full text người dùng.

### 5. Giao Diện Glacier

Frontend cũ đã được thay bằng giao diện Glacier glassmorphism:

- nhập văn bản
- chọn ngôn ngữ nguồn/đích
- đổi chiều ngôn ngữ
- dịch bằng API
- copy bản dịch
- lịch sử dịch bằng `localStorage`
- loading/error/empty state
- light/dark mode
- lưu theme vào `localStorage`

### 6. Đa Ngôn Ngữ Giao Diện

Nút chọn ngôn ngữ giao diện đã hoạt động:

- Tiếng Việt
- English

Text UI được quản lý trong:

```js
translations.vi
translations.en
```

Hàm chính:

- `setUILanguage(lang)`
- `applyTranslations()`
- `getText(key)`

Ngôn ngữ UI lưu tại:

```text
localStorage: glacier.translate.uiLanguage
```

## Biến Môi Trường Backend

Server:

- `NODE_ENV`: mặc định `development`
- `HOST`: mặc định `0.0.0.0`
- `PORT`: mặc định `3000`
- `LOG_LEVEL`: mặc định `debug` ở dev, `info` ở production
- `LOG_FORMAT`: mặc định `json`

Translation:

- `TRANSLATION_PROVIDER`: `google_unofficial` hoặc `mock`
- `TRANSLATION_FALLBACK_PROVIDER`: provider fallback tùy chọn
- `TRANSLATION_TIMEOUT_MS`: mặc định `10000`
- `TRANSLATION_MAX_TEXT_LENGTH`: mặc định `5000`
- `TRANSLATION_GOOGLE_TKK`: token seed cho Google unofficial
- `TRANSLATE_TKK` / `TRANSLATE_TK`: alias cũ
- `TRANSLATION_USER_AGENT`: user agent khi gọi Google unofficial

Rate limit/cache:

- `RATE_LIMIT_MAX`: mặc định `100`
- `RATE_LIMIT_WINDOW_MS`: mặc định `60000`
- `CACHE_ENABLED`: mặc định `false`
- `CACHE_TTL_SECONDS`: mặc định `3600`

## API Translate

Request:

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Hello world\",\"from\":\"en\",\"to\":\"vi\",\"raw\":false}"
```

Response thành công:

```json
{
  "success": true,
  "data": {
    "text": "Xin chào thế giới",
    "from": {
      "language": {
        "didYouMean": false,
        "iso": "en"
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

## Cấu Trúc Chính

```text
public/
  index.html
  styles.css
  app.js

src/
  app.js
  server.js
  index.js
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
  test.js

vite.config.js
dist/
```

## Test Hiện Có

Test hiện kiểm tra:

- lookup ngôn ngữ
- generate token
- build URL Google unofficial
- parse response
- validate input
- service dịch bằng mock provider
- API `POST /api/translate`
- provider lỗi không làm app crash
- fallback provider

Chạy:

```bash
npm test
```

## Deploy Từng Bước

```bash
npm install
npm run build
npm run deploy
```

Sau đó vào:

```text
https://leminhhuy1122.github.io/Translation/
```

## License

MIT
