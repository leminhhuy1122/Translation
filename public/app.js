const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_TRANSLATE_URL = `${API_BASE_URL}/api/translate`;
const HISTORY_STORAGE_KEY = 'glacier.translate.history';
const THEME_STORAGE_KEY = 'glacier.translate.theme';
const UI_LANGUAGE_STORAGE_KEY = 'glacier.translate.uiLanguage';
const MAX_TEXT_LENGTH = 5000;
const MAX_HISTORY_ITEMS = 6;

// Bộ từ điển giao diện. Tất cả text UI tĩnh và động đều lấy qua getText().
const translations = {
  vi: {
    appTitle: 'Glacier Translate',
    metaDescription: 'Glacier Translate - giao diện dịch thuật tiếng Việt với chế độ sáng tối và lịch sử dịch.',
    mainNavigation: 'Điều hướng chính',
    navTranslator: 'Dịch thuật',
    navHistory: 'Lịch sử',
    navSaved: 'Đã lưu',
    openLanguageMenu: 'Mở menu chọn ngôn ngữ giao diện',
    uiLanguageMenu: 'Ngôn ngữ giao diện',
    toggleTheme: 'Chuyển giao diện sáng tối',
    heroEyebrow: 'Dịch thuật chuyên dụng',
    heroTitle: 'Phá bỏ mọi rào cản ngôn ngữ',
    heroSubtitle: 'Trải nghiệm dịch thuật nhanh',
    translatorAria: 'Công cụ dịch',
    sourceLanguage: 'Ngôn ngữ nguồn',
    targetLanguage: 'Ngôn ngữ đích',
    inputPlaceholder: 'Nhập văn bản cần dịch...',
    outputPlaceholder: 'Bản dịch sẽ hiển thị tại đây...',
    translateButton: 'Dịch ngay',
    loading: 'Đang dịch...',
    loadingStatus: 'Đang gửi yêu cầu dịch...',
    copyButton: 'Sao chép bản dịch',
    clearButton: 'Xóa nội dung',
    swapLanguages: 'Đổi chiều ngôn ngữ',
    recentTranslations: 'Bản dịch gần đây',
    clearHistory: 'Xóa lịch sử',
    emptyHistory: 'Chưa có bản dịch nào. Hãy thử dịch một câu đầu tiên.',
    footerText: 'Giao diện Frozen Light, kết nối trực tiếp với API dịch hiện tại.',
    copied: 'Đã sao chép bản dịch',
    copyFailed: 'Không thể sao chép. Vui lòng thử lại.',
    error: 'Không thể dịch lúc này',
    translationFailed: 'Không thể dịch lúc này. Vui lòng thử lại.',
    emptyInput: 'Vui lòng nhập văn bản cần dịch.',
    sameLanguage: 'Ngôn ngữ nguồn và ngôn ngữ đích không được giống nhau.',
    selectConcreteSource: 'Vui lòng chọn ngôn ngữ nguồn cụ thể trước khi đổi chiều.',
    invalidApiResponse: 'API không trả về bản dịch hợp lệ.',
    unableWithStatus: 'Không thể dịch lúc này. Mã lỗi {status}.',
    completedIn: 'Dịch xong trong {elapsedMs}ms.',
    detectedLanguage: 'Nhận diện: {language}',
    historyRestored: 'Đã khôi phục bản dịch từ lịch sử',
    historyCleared: 'Đã xóa lịch sử dịch',
    minuteAgo: '1 phút trước',
    minutesAgo: '{count} phút trước',
    hourAgo: '1 giờ trước',
    hoursAgo: '{count} giờ trước',
    dayAgo: '1 ngày trước',
    daysAgo: '{count} ngày trước',
    uiLanguageVi: 'Tiếng Việt',
    uiLanguageEn: 'English',
    langAuto: 'Tự động nhận diện',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    langFr: 'Tiếng Pháp',
    langEs: 'Tiếng Tây Ban Nha',
    langDe: 'Tiếng Đức',
    langJa: 'Tiếng Nhật',
    langKo: 'Tiếng Hàn',
    langZhCn: 'Tiếng Trung giản thể',
    langTh: 'Tiếng Thái',
    langId: 'Tiếng Indonesia',
    langMs: 'Tiếng Mã Lai',
    langLo: 'Tiếng Lào',
    langKm: 'Tiếng Khmer',
    langAr: 'Tiếng Ả Rập',
    langHi: 'Tiếng Hindi',
    langRu: 'Tiếng Nga',
    langPt: 'Tiếng Bồ Đào Nha',
    langIt: 'Tiếng Ý',
    langNl: 'Tiếng Hà Lan'
  },
  en: {
    appTitle: 'Glacier Translate',
    metaDescription: 'Glacier Translate - a translation interface with light and dark mode plus translation history.',
    mainNavigation: 'Main navigation',
    navTranslator: 'Translator',
    navHistory: 'History',
    navSaved: 'Saved',
    openLanguageMenu: 'Open UI language menu',
    uiLanguageMenu: 'UI language',
    toggleTheme: 'Toggle light and dark mode',
    heroEyebrow: 'Specialized translation',
    heroTitle: 'Break every language barrier',
    heroSubtitle: 'Experience fast translation.',
    translatorAria: 'Translator tool',
    sourceLanguage: 'Source language',
    targetLanguage: 'Target language',
    inputPlaceholder: 'Enter text to translate...',
    outputPlaceholder: 'Translation will appear here...',
    translateButton: 'Translate',
    loading: 'Translating...',
    loadingStatus: 'Sending translation request...',
    copyButton: 'Copy translation',
    clearButton: 'Clear text',
    swapLanguages: 'Swap languages',
    recentTranslations: 'Recent translations',
    clearHistory: 'Clear history',
    emptyHistory: 'No translations yet. Try translating your first sentence.',
    footerText: 'Frozen Light interface, connected directly to the current translation API.',
    copied: 'Translation copied',
    copyFailed: 'Unable to copy. Please try again.',
    error: 'Unable to translate right now',
    translationFailed: 'Unable to translate right now. Please try again.',
    emptyInput: 'Please enter text to translate.',
    sameLanguage: 'Source and target languages must be different.',
    selectConcreteSource: 'Please choose a specific source language before swapping.',
    invalidApiResponse: 'The API did not return a valid translation.',
    unableWithStatus: 'Unable to translate right now. Error code {status}.',
    completedIn: 'Translated in {elapsedMs}ms.',
    detectedLanguage: 'Detected: {language}',
    historyRestored: 'Translation restored from history',
    historyCleared: 'Translation history cleared',
    minuteAgo: '1 minute ago',
    minutesAgo: '{count} minutes ago',
    hourAgo: '1 hour ago',
    hoursAgo: '{count} hours ago',
    dayAgo: '1 day ago',
    daysAgo: '{count} days ago',
    uiLanguageVi: 'Tiếng Việt',
    uiLanguageEn: 'English',
    langAuto: 'Auto detect',
    langVi: 'Vietnamese',
    langEn: 'English',
    langFr: 'French',
    langEs: 'Spanish',
    langDe: 'German',
    langJa: 'Japanese',
    langKo: 'Korean',
    langZhCn: 'Chinese Simplified',
    langTh: 'Thai',
    langId: 'Indonesian',
    langMs: 'Malay',
    langLo: 'Lao',
    langKm: 'Khmer',
    langAr: 'Arabic',
    langHi: 'Hindi',
    langRu: 'Russian',
    langPt: 'Portuguese',
    langIt: 'Italian',
    langNl: 'Dutch'
  }
};

// Danh sách ngôn ngữ dịch. Label được lấy từ i18n để đổi theo ngôn ngữ giao diện.
const TRANSLATION_LANGUAGES = [
  ['auto', 'langAuto'],
  ['vi', 'langVi'],
  ['en', 'langEn'],
  ['fr', 'langFr'],
  ['es', 'langEs'],
  ['de', 'langDe'],
  ['ja', 'langJa'],
  ['ko', 'langKo'],
  ['zh-cn', 'langZhCn'],
  ['th', 'langTh'],
  ['id', 'langId'],
  ['ms', 'langMs'],
  ['lo', 'langLo'],
  ['km', 'langKm'],
  ['ar', 'langAr'],
  ['hi', 'langHi'],
  ['ru', 'langRu'],
  ['pt', 'langPt'],
  ['it', 'langIt'],
  ['nl', 'langNl']
];

const elements = {
  html: document.documentElement,
  metaDescription: document.querySelector('meta[name="description"]'),
  uiLanguageRoot: document.querySelector('.ui-language'),
  uiLanguageToggle: document.getElementById('ui-language-toggle'),
  uiLanguageLabel: document.getElementById('ui-language-label'),
  uiLanguageMenu: document.getElementById('ui-language-menu'),
  uiLanguageOptions: [...document.querySelectorAll('[data-ui-language]')],
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  sourceLanguage: document.getElementById('source-language'),
  targetLanguage: document.getElementById('target-language'),
  sourceText: document.getElementById('source-text'),
  charCount: document.getElementById('char-count'),
  clearInput: document.getElementById('clear-input'),
  swapLanguages: document.getElementById('swap-languages'),
  translateButton: document.getElementById('translate-button'),
  translateButtonText: document.getElementById('translate-button-text'),
  translationOutput: document.getElementById('translation-output'),
  copyTranslation: document.getElementById('copy-translation'),
  detectedLanguage: document.getElementById('detected-language'),
  statusMessage: document.getElementById('status-message'),
  historyList: document.getElementById('history-list'),
  historyEmpty: document.getElementById('history-empty'),
  clearHistory: document.getElementById('clear-history'),
  toast: document.getElementById('toast')
};

let currentUILanguage = normalizeUILanguage(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY));
let activeAbortController = null;
let latestTranslationText = '';
let toastTimer = null;
let currentStatus = null;
let currentToast = null;
let outputState = 'empty';
let isTranslating = false;
let currentDetectedLanguage = '';
let currentDetectedSource = '';

initializeApp();

function initializeApp() {
  restoreTheme();
  buildLanguageOptions();
  applyTranslations();
  renderHistory();
  bindUiEvents();
  updateCharCount();
}

// Lấy text theo key, có fallback về tiếng Việt và hỗ trợ biến {name}.
function getText(key, values = {}) {
  const dictionary = translations[currentUILanguage] || translations.vi;
  const fallbackDictionary = translations.vi;
  const template = dictionary[key] ?? fallbackDictionary[key] ?? key;

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function normalizeUILanguage(language) {
  return language === 'en' ? 'en' : 'vi';
}

// Đổi ngôn ngữ UI, lưu localStorage và render lại toàn bộ text không cần reload.
function setUILanguage(language) {
  const nextLanguage = normalizeUILanguage(language);
  const sourceValue = elements.sourceLanguage.value || 'vi';
  const targetValue = elements.targetLanguage.value || 'en';

  currentUILanguage = nextLanguage;
  localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, nextLanguage);
  elements.html.lang = nextLanguage;

  updateUILanguageMenu();
  closeUILanguageMenu();
  buildLanguageOptions(sourceValue, targetValue);
  applyTranslations();
  renderOutputForCurrentLanguage();
  renderDetectedLanguage(currentDetectedLanguage, currentDetectedSource);
  renderHistory();
}

// Áp dụng data-i18n, placeholder, title và aria-label cho HTML.
function applyTranslations() {
  document.title = getText('appTitle');
  if (elements.metaDescription) {
    elements.metaDescription.setAttribute('content', getText('metaDescription'));
  }

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = getText(node.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', getText(node.dataset.i18nPlaceholder));
  });

  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.setAttribute('title', getText(node.dataset.i18nTitle));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    node.setAttribute('aria-label', getText(node.dataset.i18nAria));
  });

  updateUILanguageMenu();

  if (isTranslating) {
    setLoadingState(true);
  } else {
    elements.translateButtonText.textContent = getText('translateButton');
  }

  if (currentStatus) {
    renderStatusFromState();
  }

  if (currentToast && elements.toast.classList.contains('visible')) {
    elements.toast.textContent = getText(currentToast.key, currentToast.values);
  }
}

// Tạo danh sách ngôn ngữ dịch cho cả nguồn và đích theo ngôn ngữ UI hiện tại.
function buildLanguageOptions(sourceValue = 'vi', targetValue = 'en') {
  elements.sourceLanguage.innerHTML = createLanguageOptions(true);
  elements.targetLanguage.innerHTML = createLanguageOptions(false);
  elements.sourceLanguage.value = sourceValue;
  elements.targetLanguage.value = targetValue === 'auto' ? 'en' : targetValue;
}

function createLanguageOptions(includeAuto) {
  return TRANSLATION_LANGUAGES
    .filter(([code]) => includeAuto || code !== 'auto')
    .map(([code, labelKey]) => `<option value="${code}">${getText(labelKey)}</option>`)
    .join('');
}

function getTranslationLanguageLabel(code) {
  const language = TRANSLATION_LANGUAGES.find(([itemCode]) => itemCode === code);
  return language ? getText(language[1]) : code.toUpperCase();
}

// Khôi phục theme từ localStorage để reload trang vẫn giữ đúng sáng/tối.
function restoreTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(savedTheme || preferredTheme);
}

// Cập nhật attribute trên html để toàn bộ CSS đổi theme đồng bộ.
function applyTheme(theme) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  elements.html.dataset.theme = normalizedTheme;
  elements.themeIcon.textContent = normalizedTheme === 'light' ? 'light_mode' : 'dark_mode';
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
}

function toggleTheme() {
  const nextTheme = elements.html.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
}

// Gắn toàn bộ sự kiện UI tại một nơi để dễ bảo trì.
function bindUiEvents() {
  elements.uiLanguageToggle.addEventListener('click', toggleUILanguageMenu);
  elements.uiLanguageOptions.forEach((option) => {
    option.addEventListener('click', () => setUILanguage(option.dataset.uiLanguage));
  });

  document.addEventListener('click', handleOutsideLanguageMenuClick);
  document.addEventListener('keydown', handleGlobalKeydown);
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.sourceText.addEventListener('input', handleTextInput);
  elements.clearInput.addEventListener('click', clearSourceText);
  elements.swapLanguages.addEventListener('click', swapLanguages);
  elements.translateButton.addEventListener('click', translateCurrentText);
  elements.copyTranslation.addEventListener('click', copyCurrentTranslation);
  elements.clearHistory.addEventListener('click', clearHistory);

  elements.sourceText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      translateCurrentText();
    }
  });
}

// Mở hoặc đóng dropdown ngôn ngữ giao diện.
function toggleUILanguageMenu() {
  const isOpen = elements.uiLanguageRoot.classList.toggle('open');
  elements.uiLanguageToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeUILanguageMenu() {
  elements.uiLanguageRoot.classList.remove('open');
  elements.uiLanguageToggle.setAttribute('aria-expanded', 'false');
}

function handleOutsideLanguageMenuClick(event) {
  if (!elements.uiLanguageRoot.contains(event.target)) {
    closeUILanguageMenu();
  }
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape') {
    closeUILanguageMenu();
  }
}

function updateUILanguageMenu() {
  elements.uiLanguageLabel.textContent = getText(currentUILanguage === 'vi' ? 'uiLanguageVi' : 'uiLanguageEn');
  elements.uiLanguageOptions.forEach((option) => {
    const isSelected = option.dataset.uiLanguage === currentUILanguage;
    option.setAttribute('aria-selected', String(isSelected));
  });
}

function handleTextInput() {
  updateCharCount();
  clearStatus();
}

function updateCharCount() {
  const length = elements.sourceText.value.length;
  elements.charCount.textContent = `${length} / ${MAX_TEXT_LENGTH}`;
  elements.charCount.classList.toggle('warn', length > 4500 && length <= MAX_TEXT_LENGTH);
  elements.charCount.classList.toggle('over', length > MAX_TEXT_LENGTH);
}

function clearSourceText() {
  elements.sourceText.value = '';
  latestTranslationText = '';
  currentDetectedLanguage = '';
  currentDetectedSource = '';
  outputState = 'empty';
  renderOutputForCurrentLanguage();
  elements.copyTranslation.disabled = true;
  elements.detectedLanguage.textContent = '';
  clearStatus();
  updateCharCount();
  elements.sourceText.focus();
}

// Đổi chiều ngôn ngữ. Nếu nguồn là tự động nhận diện thì không thể đảo chiều an toàn.
function swapLanguages() {
  const from = elements.sourceLanguage.value;
  const to = elements.targetLanguage.value;

  if (from === 'auto') {
    showStatusKey('selectConcreteSource', 'error');
    return;
  }

  elements.sourceLanguage.value = to;
  elements.targetLanguage.value = from;

  if (latestTranslationText) {
    const previousSource = elements.sourceText.value;
    elements.sourceText.value = latestTranslationText;
    latestTranslationText = previousSource;
    outputState = previousSource ? 'translated' : 'empty';
    renderOutputForCurrentLanguage();
    updateCharCount();
  }
}

// Xử lý request dịch thật đến backend hiện tại bằng relative path.
async function translateCurrentText() {
  const text = elements.sourceText.value.trim();
  const from = elements.sourceLanguage.value;
  const to = elements.targetLanguage.value;

  if (!text) {
    showStatusKey('emptyInput', 'error');
    elements.sourceText.focus();
    return;
  }

  if (from !== 'auto' && from === to) {
    showStatusKey('sameLanguage', 'error');
    return;
  }

  if (activeAbortController) {
    activeAbortController.abort();
  }

  const requestController = new AbortController();
  activeAbortController = requestController;
  setLoadingState(true);

  const startedAt = performance.now();

  try {
    const response = await fetch(API_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: requestController.signal,
      body: JSON.stringify({
        text,
        from,
        to,
        raw: false
      })
    });

    const payload = await safeReadJson(response);

    if (!response.ok || payload?.success === false) {
      const requestError = new Error('TRANSLATION_REQUEST_FAILED');
      requestError.status = response.status;
      throw requestError;
    }

    const normalized = normalizeTranslationResponse(payload);
    const elapsedMs = Math.round(performance.now() - startedAt);

    renderTranslation(normalized.text);
    showStatusKey('completedIn', 'success', { elapsedMs });
    renderDetectedLanguage(normalized.detectedLanguage, from);
    saveHistory({
      sourceText: text,
      translatedText: normalized.text,
      from,
      to,
      createdAt: Date.now()
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    renderTranslation('', true);
    if (error.status) {
      showStatusKey('unableWithStatus', 'error', { status: error.status });
    } else if (error.message === 'INVALID_API_RESPONSE') {
      showStatusKey('invalidApiResponse', 'error');
    } else {
      showStatusKey('translationFailed', 'error');
    }
    showToastKey('error');
  } finally {
    setLoadingState(false);
    if (activeAbortController === requestController) {
      activeAbortController = null;
    }
  }
}

// Đọc JSON an toàn để UI không vỡ nếu backend trả rỗng hoặc sai format.
async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Chuẩn hóa response để chịu được nhiều shape khác nhau khi provider thay đổi.
function normalizeTranslationResponse(payload) {
  const data = payload?.data ?? payload ?? {};
  const text =
    data.text ??
    data.translatedText ??
    data.translation ??
    payload?.text ??
    '';

  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('INVALID_API_RESPONSE');
  }

  return {
    text,
    detectedLanguage: data?.from?.language?.iso || data.detectedLanguage || ''
  };
}

function renderTranslation(text, isError = false) {
  latestTranslationText = text;
  outputState = text ? 'translated' : (isError ? 'error' : 'empty');
  renderOutputForCurrentLanguage();
}

function renderOutputForCurrentLanguage() {
  if (outputState === 'translated') {
    elements.translationOutput.textContent = latestTranslationText;
    elements.translationOutput.classList.remove('placeholder');
    elements.copyTranslation.disabled = false;
    return;
  }

  elements.translationOutput.textContent = getText(outputState === 'error' ? 'translationFailed' : 'outputPlaceholder');
  elements.translationOutput.classList.add('placeholder');
  elements.copyTranslation.disabled = true;
}

function renderDetectedLanguage(detectedLanguage, selectedSource) {
  currentDetectedLanguage = detectedLanguage;
  currentDetectedSource = selectedSource;

  if (selectedSource === 'auto' && detectedLanguage) {
    elements.detectedLanguage.textContent = getText('detectedLanguage', {
      language: getTranslationLanguageLabel(detectedLanguage)
    });
    return;
  }

  elements.detectedLanguage.textContent = '';
}

function setLoadingState(nextIsLoading) {
  isTranslating = nextIsLoading;
  elements.translateButton.disabled = nextIsLoading;
  elements.translateButton.classList.toggle('loading', nextIsLoading);
  elements.translateButtonText.textContent = getText(nextIsLoading ? 'loading' : 'translateButton');

  if (nextIsLoading) {
    elements.statusMessage.className = 'status-message';
    elements.statusMessage.textContent = getText('loadingStatus');
    currentStatus = { key: 'loadingStatus', type: '', values: {} };
    return;
  }

  if (currentStatus?.key === 'loadingStatus') {
    clearStatus();
  }
}

function showStatusKey(key, type, values = {}) {
  currentStatus = { key, type, values };
  renderStatusFromState();
}

function renderStatusFromState() {
  if (!currentStatus) {
    clearStatus();
    return;
  }

  elements.statusMessage.textContent = getText(currentStatus.key, currentStatus.values);
  elements.statusMessage.className = `status-message ${currentStatus.type}`;
}

function clearStatus() {
  currentStatus = null;
  elements.statusMessage.textContent = '';
  elements.statusMessage.className = 'status-message';
}

async function copyCurrentTranslation() {
  if (!latestTranslationText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(latestTranslationText);
    showToastKey('copied');
  } catch {
    showToastKey('copyFailed');
  }
}

function showToastKey(key, values = {}) {
  clearTimeout(toastTimer);
  currentToast = { key, values };
  elements.toast.textContent = getText(key, values);
  elements.toast.classList.add('visible');

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 2200);
}

// Lưu lịch sử dịch vào localStorage để giữ lại sau khi reload trang.
function saveHistory(entry) {
  const history = loadHistory();
  const nextHistory = [
    entry,
    ...history.filter((item) => item.sourceText !== entry.sourceText || item.to !== entry.to)
  ].slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  renderHistory(nextHistory);
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Render lịch sử và cho phép bấm card để khôi phục bản dịch cũ.
function renderHistory(history = loadHistory()) {
  elements.historyList.innerHTML = '';
  elements.historyEmpty.classList.toggle('visible', history.length === 0);
  elements.clearHistory.disabled = history.length === 0;

  for (const item of history) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-meta">
        <span class="language-pair">
          ${formatLanguageCode(item.from)}
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          ${formatLanguageCode(item.to)}
        </span>
        <span>${formatRelativeTime(item.createdAt)}</span>
      </div>
      <p class="history-source">${escapeHtml(item.sourceText)}</p>
      <p class="history-result">${escapeHtml(item.translatedText)}</p>
    `;

    card.addEventListener('click', () => restoreHistoryItem(item));
    elements.historyList.appendChild(card);
  }
}

function restoreHistoryItem(item) {
  elements.sourceLanguage.value = item.from;
  elements.targetLanguage.value = item.to;
  elements.sourceText.value = item.sourceText;
  renderTranslation(item.translatedText);
  updateCharCount();
  showToastKey('historyRestored');
  document.getElementById('translator').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearHistory() {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  renderHistory([]);
  showToastKey('historyCleared');
}

function formatLanguageCode(code) {
  return code === 'auto' ? 'AUTO' : code.toUpperCase();
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) {
    return getText(minutes === 1 ? 'minuteAgo' : 'minutesAgo', { count: minutes });
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return getText(hours === 1 ? 'hourAgo' : 'hoursAgo', { count: hours });
  }

  const days = Math.round(hours / 24);
  return getText(days === 1 ? 'dayAgo' : 'daysAgo', { count: days });
}

// Escape nội dung lịch sử trước khi đưa vào HTML để tránh chèn markup ngoài ý muốn.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
