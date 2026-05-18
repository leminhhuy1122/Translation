# Translate AI / Glacier Translate

## Chạy Code

Yêu cầu:

- Node.js 22+
- npm 10+

Cài dependency:

```bash
npm install
```

Chạy dev server:

```bash
npm run dev
```

Chạy production mode:

```bash
npm run start:prod
```

Mở giao diện:

```text
http://127.0.0.1:3000
```

Kiểm tra chất lượng code:

```bash
npm run lint
npm test
```

Chạy tất cả check:

```bash
npm run check
```

## Tóm Tắt Dự Án

Đây là Node.js API server dùng ES Modules, runtime Node.js 22+, có frontend tĩnh trong `public/`.

Backend cung cấp API dịch:

- `GET /health`
- `POST /api/translate`
- `GET /api/languages`
- `GET /api/languages/:code`

Frontend gọi API bằng relative path `/api/translate`, không hardcode `localhost`, nên dễ deploy hơn.

## Những Gì Đã Thay Đổi

### 1. Refactor Backend

Backend đã được tách lại theo cấu trúc rõ trách nhiệm:

- `src/app.js`: tạo Express app, middleware, route.
- `src/server.js`: bootstrap server và graceful shutdown.
- `src/routes/`: định nghĩa route.
- `src/controllers/`: nhận request và trả response.
- `src/services/translation.service.js`: xử lý flow dịch, cache, fallback, logging.
- `src/providers/translation/`: chứa các provider dịch.
- `src/config/env.js`: đọc và validate env.
- `src/middlewares/`: error handler, rate limit.
- `src/errors/AppError.js`: chuẩn hóa lỗi.
- `src/utils/`: helper dùng chung.
- `src/logger/logger.js`: Winston logger.

### 2. Tách Translation Provider

Logic gọi Google Translate unofficial đã được đóng gói riêng trong:

```text
src/providers/translation/google-unofficial.provider.js
```

Hiện có provider:

- `google_unofficial`: provider mặc định, giữ behavior cũ.
- `mock`: provider giả lập để test/dev/fallback.

Service hiện làm việc qua abstraction provider, nên sau này có thể đổi sang Google Cloud Translate, DeepL, LibreTranslate hoặc provider khác mà không cần sửa controller/route.

### 3. Error Handling An Toàn Hơn

Nếu provider lỗi, timeout, response sai format hoặc Google đổi cơ chế token, app không crash. API trả lỗi thống nhất:

```json
{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Backend không log full text người dùng, chỉ log metadata như ngôn ngữ, độ dài text và thời gian xử lý.

### 4. Giao Diện Glacier Mới

Giao diện cũ trong `public/` đã được thay bằng giao diện Glacier glassmorphism:

- `public/index.html`
- `public/styles.css`
- `public/app.js`

Frontend đã có:

- nhập văn bản
- chọn ngôn ngữ nguồn/đích
- đổi chiều ngôn ngữ
- dịch bằng API thật
- copy bản dịch
- lịch sử dịch bằng `localStorage`
- loading state
- error state
- empty state
- light/dark mode
- lưu theme vào `localStorage`

### 5. Đa Ngôn Ngữ Giao Diện

Nút chọn ngôn ngữ giao diện đã hoạt động thật:

- Tiếng Việt
- English

Toàn bộ text UI được quản lý trong object i18n:

```js
translations.vi
translations.en
```

Các hàm chính:

- `setUILanguage(lang)`
- `applyTranslations()`
- `getText(key)`

Ngôn ngữ UI được lưu vào:

```text
localStorage: glacier.translate.uiLanguage
```

## Biến Môi Trường

Server:

- `NODE_ENV`: mặc định `development`
- `HOST`: mặc định `0.0.0.0`
- `PORT`: mặc định `3000`
- `LOG_LEVEL`: mặc định `debug` ở dev, `info` ở production
- `LOG_FORMAT`: mặc định `json`

Translation:

- `TRANSLATION_PROVIDER`: `google_unofficial` hoặc `mock`
- `TRANSLATION_FALLBACK_PROVIDER`: provider fallback tùy chọn, ví dụ `mock`
- `TRANSLATION_TIMEOUT_MS`: mặc định `10000`
- `TRANSLATION_MAX_TEXT_LENGTH`: mặc định `5000`
- `TRANSLATION_GOOGLE_TKK`: token seed cho Google unofficial
- `TRANSLATE_TKK` / `TRANSLATE_TK`: alias cũ vẫn được hỗ trợ
- `TRANSLATION_USER_AGENT`: user agent khi gọi Google unofficial

Rate limit/cache:

- `RATE_LIMIT_MAX`: mặc định `100`
- `RATE_LIMIT_WINDOW_MS`: mặc định `60000`
- `CACHE_ENABLED`: mặc định `false`
- `CACHE_TTL_SECONDS`: mặc định `3600`

Ví dụ chạy bằng mock provider:

```bash
TRANSLATION_PROVIDER=mock npm run dev
```

Ví dụ bật fallback mock:

```bash
TRANSLATION_PROVIDER=google_unofficial TRANSLATION_FALLBACK_PROVIDER=mock npm run dev
```

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
src/
  app.js
  server.js
  index.js
  config/
    env.js
  controllers/
  errors/
  logger/
  middlewares/
  providers/
    translation/
  routes/
  services/
  utils/
  validators/
  test.js

public/
  index.html
  styles.css
  app.js
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

## Ghi Chú

- Không tạo Docker.
- Không đổi stack.
- Không đổi endpoint hiện có.
- Frontend và backend vẫn chạy chung trên Express server.
- Google Translate unofficial vẫn là rủi ro bên ngoài, nhưng đã được cô lập trong provider riêng để dễ thay thế.

## License

MIT
