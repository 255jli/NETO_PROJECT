// static/js/overview.js
// ========== ДАННЫЕ ========== 
// Данные в window.events и window.filteredEvents из data.js

// ========== КОНФИГУРАЦИЯ ==========
// Модель «как в Яндекс.Метрике»: дашборд — это колонка рядов. Внутри ряда виджеты
// всегда занимают равную долю ширины и растягиваются на всю высоту ряда
// (flex: 1 1 0): два виджета → 50/50, три → по трети и т.д. Ширина заполняет
// всю строку автоматически (flexbox), у всех виджетов ряда одинаковая высота.

// Макет по умолчанию: ключевые KPI сверху, связанные метрики сгруппированы.
const DEFAULT_LAYOUT = {
    rows: [
        {
            id: 'row-1',
            label: 'Ключевые показатели',
            widgets: [
                { widgetId: 'summary-stats' }
            ]
        },
        {
            id: 'row-2',
            label: 'Активность и расходы',
            widgets: [ // Изменил подпись
                { widgetId: 'unbooked-trend' },
                { widgetId: 'spent-counter' } // Вернул 'spent-counter'
            ]
        },
        {
            id: 'row-3',
            label: 'Конверсия',
            widgets: [
                { widgetId: 'distribution-chart' },
                { widgetId: 'conversion-funnel' }
            ]
        },
        {
            id: 'row-4',
            label: 'Клиенты и сервисы',
            widgets: [
                { widgetId: 'recent-clients' },
                { widgetId: 'top-services' }
            ]
        },
        {
            id: 'row-5',
            label: 'Динамика',
            widgets: [
                { widgetId: 'weekly-bar' },
                { widgetId: 'hourly-activity' }
            ]
        }
    ]
};

// Категории виджетов — используются для контекстной подсветки при перетаскивании.
const WIDGET_CATEGORIES = {
    'unbooked-trend': 'activity',
    'distribution-chart': 'conversion',
    'spent-counter': 'revenue', // Оставил как 'revenue' для расходов
    'recent-clients': 'clients',
    'weekly-bar': 'activity',
    'top-services': 'services',
    'mini-calendar': 'schedule',
    'summary-stats': 'revenue',
    'hourly-activity': 'activity',
    'recent-calls-table': 'clients',
    'conversion-funnel': 'conversion',
    'top-clients': 'clients',
    'spent-line-chart': 'revenue', // Новая категория
    'generic-bar-chart': 'chart', // Новая категория
    'generic-pie-chart': 'chart'  // Новая категория
};

const CATEGORY_LABELS = {
    activity: 'Активность',
    conversion: 'Конверсия',
    revenue: 'Выручка',
    clients: 'Клиенты',
    services: 'Услуги',
    schedule: 'Расписание'
};

function getWidgetCategory(widgetId) {
    return WIDGET_CATEGORIES[widgetId] || 'other';
}

const DEFAULT_WIDGET_CONFIGS = {
    'unbooked-trend': { days: 7 },
    'distribution-chart': { period: 'month' },
    'spent-counter': { period: 'month', layout: 'line' }, // Добавил layout для нового типа
    'recent-clients': { count: 3 },
    'weekly-bar': {},
    'top-services': { count: 5 },
    'mini-calendar': {},
    'summary-stats': {},
    'hourly-activity': {},
    'recent-calls-table': { count: 5 },
    'conversion-funnel': {},
    'top-clients': { count: 5 },
    'spent-line-chart': { period: 'month', days: 7 }, // Конфиг для нового типа
    'generic-bar-chart': { period: 'month', valueType: 'count' }, // Конфиг для нового типа
    'generic-pie-chart': { period: 'month', valueType: 'count' }  // Конфиг для нового типа
};

// Разделы библиотеки виджетов для группировки в модалке выбора.
const WIDGET_SECTIONS = {
    chart: 'Графики',
    list: 'Списки',
    counter: 'Счётчики',
    schedule: 'Календарь'
};
const WIDGET_SECTION_ORDER = ['chart', 'list', 'counter', 'schedule'];

// Собственные SVG-превью для каждого типа виджета (без эмодзи).
const WIDGET_TYPES_INFO = {
    'unbooked-trend': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 20h18"/><polyline points="5 15 9 10 13 13 21 5"/></svg>', section: 'chart', description: 'Тренд незаписанных обращений за период.' },
    'distribution-chart': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></svg>', section: 'chart', description: 'Распределение по статусам.' },
    'weekly-bar': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="3" height="8" rx="1"/><rect x="10" y="6" width="3" height="13" rx="1"/><rect x="16" y="9" width="3" height="10" rx="1"/></svg>', section: 'chart', description: 'Активность по дням недели.' },
    'top-services': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>', section: 'chart', description: 'Услуги по числу обращений.' },
    'hourly-activity': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="2 13 7 13 9 6 13 18 15 11 22 11"/></svg>', section: 'chart', description: 'Активность по часам.' },
    'conversion-funnel': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16l-6 8v6l-4 2v-8z"/></svg>', section: 'chart', description: 'Воронка конверсии.' },
    'spent-counter': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.7-1-1.8-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2c-1.2 0-2.3-.5-3-1.5"/></svg>', section: 'counter', description: 'Общая сумма расходов (теперь линейный).' }, // Обновил описание
    'summary-stats': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l4-4 3 2 4-5"/></svg>', section: 'counter', description: 'Общая статистика.' },
    'recent-clients': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M16 8a3 3 0 1 1-1 5.8"/></svg>', section: 'list', description: 'Список последних клиентов.' },
    'recent-calls-table': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>', section: 'list', description: 'Таблица последних звонков.' },
    'top-clients': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17l4-4 4 4M12 5v8"/></svg>', section: 'list', description: 'Активные клиенты по обращениям.' },
    'mini-calendar': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/><circle cx="9" cy="14" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="14" cy="18" r="1"/></svg>', section: 'schedule', description: 'Календарь с событиями.' },
    // Новые типы графиков
    'spent-line-chart': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 20h18"/><polyline points="5 15 9 10 13 13 21 5"/></svg>', section: 'chart', description: 'График расходов по дням.' },
    'generic-bar-chart': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="3" height="8" rx="1"/><rect x="10" y="6" width="3" height="13" rx="1"/><rect x="16" y="9" width="3" height="10" rx="1"/></svg>', section: 'chart', description: 'Универсальный столбчатый график.' },
    'generic-pie-chart': { previewSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></svg>', section: 'chart', description: 'Универсальный круговой график.' }
};

let dashboardLayout = null;
let widgetConfigs = {};
let isEditMode = false;
let chartInstances = {};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initDashboard() {
    if (typeof window.events === 'undefined') {
        setTimeout(initDashboard, 100);
        return;
    }
    loadLayoutAndConfigs();
    renderDashboard();
    initEventListeners();
}

function loadLayoutAndConfigs() {
    const savedLayout = localStorage.getItem('dashboardLayout');
    dashboardLayout = savedLayout ? JSON.parse(savedLayout) : JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    normalizeLayout(dashboardLayout);

    const savedConfigs = localStorage.getItem('dashboardWidgetConfigs');
    widgetConfigs = savedConfigs ? JSON.parse(savedConfigs) : JSON.parse(JSON.stringify(DEFAULT_WIDGET_CONFIGS));
}

// Приводит сохранённый макет к flex-модели: убирает старые поля сетки (col/row/span/h),
// оставляет только порядок и вес виджетов. Миграция со старого формата.
function normalizeLayout(layout) {
    if (!layout || !Array.isArray(layout.rows)) return;
    layout.rows.forEach(row => {
        if (!row || !Array.isArray(row.widgets)) return;
        // Приводим к единой flex-модели: у виджета остаются порядок, id и флаг настройки.
        row.widgets = row.widgets.map(w => ({ widgetId: w.widgetId, configured: w.configured }));
    });
    pruneEmptyRows(layout);
}

// Автоматически удаляет пустые ряды (ряды без виджетов).
function pruneEmptyRows(layout) {
    if (!layout || !Array.isArray(layout.rows)) return;
    layout.rows = layout.rows.filter(row => row && Array.isArray(row.widgets) && row.widgets.length > 0);
    saveLayout();
}

function saveLayout() {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
}

function saveConfigs() {
    localStorage.setItem('dashboardWidgetConfigs', JSON.stringify(widgetConfigs));
}

// ========== РЕНДЕР ==========
function renderDashboard() {
    const container = document.getElementById('dashboard-rows');
    container.innerHTML = '';
    const eventsData = window.filteredEvents || window.events || [];

    // Демо-режим: данных пока нет (до подключения бэкенда). Показываем
    // деликатную подсказку сверху, а сами виджеты остаются с нулями —
    // сразу видно, что умеет дашборд и что появится после наполнения.
    if ((!eventsData || eventsData.length === 0) && !isEditMode) {
        container.appendChild(createEmptyDashboardBanner());
    }

    dashboardLayout.rows.forEach(row => {
        if (isEditMode) {
            // Чёрная полоска-разделитель перед рядом: добавление нового блока здесь.
            container.appendChild(createRowDivider(row.id));
        }
        container.appendChild(createRowElement(row, eventsData));
    });
    if (isEditMode) {
        container.appendChild(createRowDivider(null));
    }

    updateEditModeUI();
}

// Деликатный баннер при пустых данных: объясняет инвестору/клиенту,
// что дашборд готов принимать реальные данные, а сейчас отображает нули.
function createEmptyDashboardBanner() {
    const banner = document.createElement('div');
    banner.className = 'empty-dashboard-banner';
    banner.innerHTML = `
        <div class="banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-5 3 3 5-6"/></svg>
        </div>
        <div class="banner-text">
            <strong>Дашборд готов к работе</strong>
            <span>Все блоки уже настроены и автоматически заполнятся реальными показателями, как только будут подключены данные. Сейчас отображаются нулевые значения.</span>
        </div>
    `;
    return banner;
}

function createRowElement(row, eventsData) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row-container';
    rowEl.id = row.id;
    rowEl.dataset.rowId = row.id;

    if (row.label) {
        const labelEl = document.createElement('div');
        labelEl.className = 'row-label';
        labelEl.textContent = row.label;
        rowEl.appendChild(labelEl);
    }

    // Внутренний flex-контейнер: виджеты делят ширину пропорционально весу.
    const gridEl = document.createElement('div');
    gridEl.className = 'row-grid';
    gridEl.dataset.rowId = row.id;
    rowEl.appendChild(gridEl);

    row.widgets.forEach((widget, index) => {
        // В режиме редактирования между виджетами появляется полоска «+»,
        // позволяющая вставить новый виджет именно в этот промежуток ряда.
        if (isEditMode) gridEl.appendChild(createWidgetDivider(row.id, index));
        gridEl.appendChild(createWidgetElement(widget, row.id, index, eventsData));
    });
    // Промежуток после последнего виджета ряда тоже позволяет добавить новый.
    if (isEditMode) gridEl.appendChild(createWidgetDivider(row.id, row.widgets.length));

    return rowEl;
}

// Тонкая полоска с «+» — создаёт новый ряд перед указанным в режиме редактирования.
function createRowDivider(beforeRowId) {
    const divider = document.createElement('div');
    divider.className = 'row-divider';
    divider.innerHTML = '<span class="row-divider-plus">+</span>';
    divider.addEventListener('click', () => {
        window.widgetPlacementInfo = { beforeRowId };
        openAddWidgetModal();
    });
    return divider;
}

// Полоска с «+» между виджетами внутри ряда — вставляет новый виджет
// в эту позицию (действует как добавление в новый ряд, но внутри ряда).
function createWidgetDivider(rowId, position) {
    const divider = document.createElement('div');
    divider.className = 'widget-divider';
    divider.innerHTML = '<span class="row-divider-plus">+</span>';
    divider.addEventListener('click', () => {
        window.widgetPlacementInfo = { rowId, position };
        openAddWidgetModal();
    });
    return divider;
}

function createWidgetElement(widget, rowId, widgetIndex, eventsData) {
    const widgetEl = document.createElement('div');
    widgetEl.className = 'widget widget-fade-in';
    widgetEl.draggable = false; // DnD реализован на Pointer Events (dashboard-dnd.js)
    widgetEl.dataset.widgetId = widget.widgetId;
    widgetEl.dataset.rowId = rowId;
    widgetEl.dataset.widgetIndex = widgetIndex;
    widgetEl.dataset.category = getWidgetCategory(widget.widgetId);
    // Все виджеты ряда делят ширину поровну и растягиваются на всю высоту ряда.
    widgetEl.style.flex = '1 1 0';
    widgetEl.style.minWidth = '0';

    const header = document.createElement('div');
    header.className = 'widget-header';
    header.innerHTML = `
        <h3>${getWidgetName(widget.widgetId)}</h3>
        <div class="widget-actions">
            <button class="widget-settings-btn" title="Настройки">⚙</button>
            ${isEditMode ? '<button class="widget-remove-btn" title="Удалить">✕</button>' : ''}
        </div>
    `;
    widgetEl.appendChild(header);

    const content = document.createElement('div');
    content.className = 'widget-content';
    widgetEl.appendChild(content);

    // Новый виджет (configured: false) ничего не показывает до настройки —
    // выводим пустую заглушку с кнопкой «Настроить». Настроенные виджеты
    // рендерят данные как обычно.
    if (widget.configured === false) {
        content.innerHTML = `
            <div class="widget-empty-state">
                <span class="widget-empty-icon">${WIDGET_TYPES_INFO[widget.widgetId]?.previewSvg || ''}</span>
                <p>Виджет не настроен</p>
                <button type="button" class="widget-configure-btn">Настроить</button>
            </div>
        `;
        const cfgBtn = content.querySelector('.widget-configure-btn');
        if (cfgBtn) {
            cfgBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openWidgetSettingsModal(widget.widgetId, widgetEl, widget);
            });
        }
    } else {
        renderWidgetContent(widget.widgetId, content, eventsData);
    }

    const settingsBtn = widgetEl.querySelector('.widget-settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openWidgetSettingsModal(widget.widgetId, widgetEl, widget);
        });
    }

    const removeBtn = widgetEl.querySelector('.widget-remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeWidget(rowId, widgetIndex);
        });
    }

    return widgetEl;
}

function getWidgetName(widgetId) {
    const names = {
        'unbooked-trend': 'Незаписанные',
        'distribution-chart': 'Статусы',
        'spent-counter': 'Расходы', // Обновил имя, убрав "(линия)"
        'recent-clients': 'Клиенты',
        'weekly-bar': 'Дни недели',
        'top-services': 'Услуги',
        'mini-calendar': 'Календарь',
        'summary-stats': 'Итоги',
        'hourly-activity': 'По часам',
        'recent-calls-table': 'Звонки',
        'conversion-funnel': 'Конверсия',
        'top-clients': 'Активные клиенты',
        // Новые имена
        'spent-line-chart': 'Расходы', // Обновил имя, убрав "(линия)"
        'generic-bar-chart': 'Столбцы',
        'generic-pie-chart': 'Круг'
    };
    return names[widgetId] || widgetId;
}

// ========== РЕНДЕРЫ ВИДЖЕТОВ ==========
function renderWidgetContent(widgetId, container, eventsData) {
    // Уничтожаем старые графики
    if (chartInstances[widgetId]) {
        Object.values(chartInstances[widgetId]).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        delete chartInstances[widgetId];
    }

    const config = { ...DEFAULT_WIDGET_CONFIGS[widgetId], ...widgetConfigs[widgetId] };
    container.innerHTML = '';

    // Пустой массив данных — это нормально: виджеты рисуют нулевую структуру,
    // а не заглушку. Это позволяет сразу видеть, что показывает каждый блок.
    switch (widgetId) {
        case 'unbooked-trend':
            renderUnbookedTrend(container, config, eventsData);
            break;
        case 'distribution-chart':
            renderDistributionChart(container, config, eventsData);
            break;
        case 'spent-counter':
            renderSpentLineChart(container, config, eventsData); // Вызов новой функции для линейного графика
            break;
        case 'recent-clients':
            renderRecentClients(container, config, eventsData);
            break;
        case 'weekly-bar':
            renderWeeklyBar(container, config, eventsData);
            break;
        case 'top-services':
            renderTopServices(container, config, eventsData);
            break;
        case 'mini-calendar':
            renderMiniCalendar(container, config, eventsData);
            break;
        case 'summary-stats':
            renderSummaryStats(container, config, eventsData);
            break;
        case 'hourly-activity':
            renderHourlyActivity(container, config, eventsData);
            break;
        case 'recent-calls-table':
            renderRecentCallsTable(container, config, eventsData);
            break;
        case 'conversion-funnel':
            renderConversionFunnel(container, config, eventsData);
            break;
        case 'top-clients':
            renderTopClients(container, config, eventsData);
            break;
        // Новые типы
        case 'spent-line-chart':
            renderSpentLineChart(container, config, eventsData);
            break;
        case 'generic-bar-chart':
            renderGenericBarChart(container, config, eventsData);
            break;
        case 'generic-pie-chart':
            renderGenericPieChart(container, config, eventsData);
            break;
        default:
            container.innerHTML = '<p>Неизвестный виджет</p>';
    }
}

// --- Утилиты для умной фильтрации ---
// Единая точка фильтрации по периоду, статусу и графку.
// Возвращает объект: { filtered, prev } — данные за выбранный период
// и те же данные за предыдущий равный период (для расчёта дельты).
function smartFilter(events, config) {
    config = config || {};
    const status = config.status || 'all';
    let filtered = events;
    let prev = [];

    if (status !== 'all') {
        filtered = filtered.filter(e => e.status === status);
    }

    // Период: берём из конфига, но если нет — глобальный currentPeriod.
    const period = config.period || window.currentPeriod || 'all';
    const now = new Date();

    if (period && period !== 'all') {
        let startDate = new Date(now);
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            default:
                startDate = null;
        }
        if (startDate) {
            const startStr = dateToStr(startDate);
            filtered = filtered.filter(e => e.date >= startStr);
            // Предыдущий период той же длины — для сравнения.
            const span = now.getTime() - startDate.getTime();
            const prevStart = new Date(startDate.getTime() - span);
            const prevEnd = startDate;
            const ps = dateToStr(prevStart);
            const pe = dateToStr(prevEnd);
            prev = events.filter(e => e.date >= ps && e.date < pe);
        }
    } else {
        // Без периода: сравнивать не с чем (нет ретроспективы).
        prev = [];
    }

    return { filtered, prev };
}

// Дельта в % между текущим и прошлым значением. NULL, если сравнивать не с чем.
function calcDelta(cur, prev) {
    if (typeof cur !== 'number' || typeof prev !== 'number' || prev === 0) return null;
    return ((cur - prev) / Math.abs(prev)) * 100;
}

// Знак и класс для отображения дельты.
function deltaHtml(delta, goodWhenUp) {
    if (delta === null) return '<span class="delta delta-neutral">—</span>';
    const isGood = goodWhenUp ? delta >= 0 : delta <= 0;
    const sign = delta > 0 ? '+' : '';
    const cls = isGood ? 'delta-positive' : 'delta-negative';
    return `<span class="delta ${cls}" title="К прошлому периоду">${sign}${delta.toFixed(1)}%</span>`;
}

function dateToStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function periodLabel(period) {
    const map = { today: 'сегодня', week: 'за неделю', month: 'за месяц', quarter: 'за квартал', all: 'за всё время' };
    return map[period] || 'за период';
}

// Плавное «живое» значение счётчика (для KPI).
function animateCounter(el, target, suffix, decimals) {
    decimals = decimals || 0;
    const dur = 600;
    const start = performance.now();
    function step(t) {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = val.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + (suffix || '');
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// --- Существующие виджеты (с небольшими правками) ---
function renderUnbookedTrend(container, config, eventsData) {
    const days = config.days || 7;
    const { filtered, prev } = smartFilter(eventsData, config);
    const layout = config.layout || 'line';

    const labels = [];
    const data = [];
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = dateToStr(d);
        labels.push(dateStr.slice(5));
        data.push(filtered.filter(e => e.date === dateStr).length);
    }

    const total = data.reduce((a, b) => a + b, 0);
    const avg = days > 0 ? (total / days) : 0;
    const bestIdx = data.indexOf(Math.max(...data));

    // Мини-сводка над графиком.
    const summary = document.createElement('div');
    summary.className = 'widget-insight';
    summary.innerHTML = `
        <span><strong>${total}</strong> всего ${periodLabel(config.period || 'all')}</span>
        <span><strong>${avg.toFixed(1)}</strong> в день</span>
        ${bestIdx >= 0 && total > 0 ? `<span>пик <strong>${labels[bestIdx]}</strong></span>` : '<span>пока нет обращений</span>'}
    `;
    container.appendChild(summary);

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Тип диаграммы из настроек (линия/область/столбцы).
    const chartType = layout === 'bar' ? 'bar' : 'line';
    const dataset = {
        label: getWidgetName('unbooked-trend'),
        data,
        borderColor: '#005FF9',
        backgroundColor: layout === 'area' ? 'rgba(0,95,249,0.15)' : 'rgba(0,95,249,0.25)',
        tension: 0.3,
        fill: layout === 'area' || layout === 'bar'
    };
    const chart = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets: [dataset] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    chartInstances['unbooked-trend'] = { main: chart };
}

function renderDistributionChart(container, config, eventsData) {
    const { filtered } = smartFilter(eventsData, config);
    const counts = {
        'записан': filtered.filter(e => e.status === 'записан').length,
        'не записан': filtered.filter(e => e.status === 'не записан').length,
        'отказ': filtered.filter(e => e.status === 'отказ').length
    };
    const total = filtered.length;

    // Центральная цифра «конверсия в запись».
    const booked = counts['записан'];
    const conversion = total > 0 ? Math.round(booked / total * 100) : 0;

    const chartWrap = document.createElement('div');
    chartWrap.className = 'donut-wrap';
    chartWrap.innerHTML = `<div class="donut-center"><strong>${conversion}%</strong><span>запись</span></div>`;
    const canvas = document.createElement('canvas');
    canvas.height = 200;
    chartWrap.appendChild(canvas);
    container.appendChild(chartWrap);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#2E7D32', '#FF8F00', '#D32F2F'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: { legend: { position: 'bottom' } }
        }
    });
    chartInstances['distribution-chart'] = { main: chart };
}

function renderSpentCounter(container, config, eventsData) {
    const { filtered, prev } = smartFilter(eventsData, config);
    const total = filtered.reduce((sum, e) => sum + e.spent, 0);
    const prevTotal = prev.reduce((sum, e) => sum + e.spent, 0);
    const delta = calcDelta(total, prevTotal);
    const orders = filtered.filter(e => e.status === 'записан').length;

    container.innerHTML = `
        <div class="counter-widget">
            <div class="counter-main">
                <div class="counter-value" id="spent-value">0 ₽</div>
                <div class="counter-delta">${deltaHtml(delta, true)} <span>к прошлому периоду</span></div>
            </div>
            <div class="counter-period">${periodLabel(config.period || 'all')} · ${orders} записей</div>
        </div>
    `;
    const valEl = container.querySelector('#spent-value');
    if (valEl) animateCounter(valEl, total, ' ₽');
}

// Новая функция для отображения расходов как линейного графика
function renderSpentLineChart(container, config, eventsData) {
    const days = config.days || 7;
    const period = config.period || 'month'; // Используем период из конфига
    // Фильтруем данные по периоду, но не по статусу, так как нас интересует общий расход
    const { filtered } = smartFilter(eventsData, { period: period });

    const labels = [];
    const data = [];

    // Получаем даты за последние 'days' дней
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = dateToStr(d);
        labels.push(dateStr.slice(5)); // Только DD-MM

        // Суммируем расходы за этот день
        const dailySpent = filtered.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.spent, 0);
        data.push(dailySpent);
    }

    const totalSpent = data.reduce((a, b) => a + b, 0);
    const avgSpent = days > 0 && totalSpent > 0 ? (totalSpent / days) : 0;
    const maxSpentIdx = data.length > 0 ? data.indexOf(Math.max(...data)) : -1;

    // Мини-сводка над графиком.
    const summary = document.createElement('div');
    summary.className = 'widget-insight';
    summary.innerHTML = `
        <span><strong>${totalSpent} ₽</strong> всего ${periodLabel(period)}</span>
        <span><strong>${avgSpent.toFixed(0)} ₽</strong> в среднем</span>
        ${maxSpentIdx >= 0 && totalSpent > 0 ? `<span>пик <strong>${labels[maxSpentIdx]}</strong></span>` : '<span>пока нет расходов</span>'}
    `;
    container.appendChild(summary);

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Используем настройку layout, если она есть, иначе 'line'
    const layout = config.layout || 'line';
    const chartType = layout === 'bar' ? 'bar' : 'line';

    const dataset = {
        label: getWidgetName('spent-counter'), // Используем имя 'Расходы (линия)'
        data,
        borderColor: '#D32F2F', // Красный цвет для расходов
        backgroundColor: layout === 'bar' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(211, 47, 47, 0.1)', // Прозрачный для линии, полупрозрачный для столбцов
        tension: 0.3,
        fill: layout === 'area' || layout === 'bar'
    };

    const chart = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets: [dataset] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
    chartInstances['spent-counter'] = { main: chart };
}

// Универсальная функция для столбчатого графика (например, расходы по категориям, если бы они были в данных)
function renderGenericBarChart(container, config, eventsData) {
    // Пример: отображение количества событий по типу услуги
    const { filtered } = smartFilter(eventsData, config);
    const valueType = config.valueType || 'count';

    let labels = [];
    let data = [];

    if (valueType === 'count') {
        const counts = {};
        filtered.forEach(e => {
            counts[e.service] = (counts[e.service] || 0) + 1;
        });
        labels = Object.keys(counts);
        data = Object.values(counts);
    } else if (valueType === 'spent') {
         // Пример: сумма расходов по услугам
         const sums = {};
         filtered.forEach(e => {
             sums[e.service] = (sums[e.service] || 0) + e.spent;
         });
         labels = Object.keys(sums);
         data = Object.values(sums);
    }
    // Другие типы значений можно добавить по аналогии

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Значение', data, backgroundColor: '#005FF9' }] },
        options: {
            indexAxis: 'y', // Горизонтальный барчарт
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });
    chartInstances['generic-bar-chart'] = { main: chart };
}

// Универсальная функция для кругового графика
function renderGenericPieChart(container, config, eventsData) {
    const { filtered } = smartFilter(eventsData, config);
    const valueType = config.valueType || 'count';

    let labels = [];
    let data = [];

    if (valueType === 'count') {
        const counts = {};
        filtered.forEach(e => {
            counts[e.service] = (counts[e.service] || 0) + 1;
        });
        labels = Object.keys(counts);
        data = Object.values(counts);
    } else if (valueType === 'spent') {
         // Пример: сумма расходов по услугам
         const sums = {};
         filtered.forEach(e => {
             sums[e.service] = (sums[e.service] || 0) + e.spent;
         });
         labels = Object.keys(sums);
         data = Object.values(sums);
    }

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: 'pie', // или 'doughnut'
        data: { labels, datasets: [{ data, backgroundColor: ['#005FF9', '#2E7D32', '#FF8F00', '#D32F2F', '#94A3B8'] }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    chartInstances['generic-pie-chart'] = { main: chart };
}

// Восстановленная функция renderTopServices
function renderTopServices(container, config, eventsData) {
    const count = config.count || 5;
    const { filtered } = smartFilter(eventsData, config);
    const serviceCounts = {};
    filtered.forEach(e => {
        serviceCounts[e.service] = (serviceCounts[e.service] || 0) + 1;
    });
    const sorted = Object.entries(serviceCounts).sort((a,b) => b[1] - a[1]).slice(0, count);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="widget-empty-state soft"><span class="widget-empty-icon"></span><p>Пока нет данных по услугам.<br>Появятся после первых обращений.</p></div>';
        return;
    }

    const total = sorted.reduce((s, [,c]) => s + c, 0);
    const summary = document.createElement('div');
    summary.className = 'widget-insight';
    summary.innerHTML = `Топ-услуга — <strong>${sorted[0][0]}</strong> (${sorted[0][1]} обращений)`;
    container.appendChild(summary);

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([service]) => service),
            datasets: [{ data: sorted.map(([,cnt]) => cnt), backgroundColor: '#005FF9' }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    chartInstances['top-services'] = { main: chart };
}

// Восстановленная функция renderMiniCalendar
function renderMiniCalendar(container, config, eventsData) {
    const { filtered } = smartFilter(eventsData, config);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    const calendar = document.createElement('div');
    calendar.className = 'mini-calendar';
    calendar.innerHTML = `
        <div class="calendar-month">${new Date(year, month, 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</div>
        <div class="calendar-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
        <div class="calendar-days"></div>
    `;
    const daysGrid = calendar.querySelector('.calendar-days');
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        daysGrid.appendChild(empty);
    }
    const eventDates = new Set(filtered.map(e => e.date));
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        if (eventDates.has(dateStr)) dayEl.classList.add('has-event');
        daysGrid.appendChild(dayEl);
    }
    container.appendChild(calendar);
}

// Восстановленная функция renderSummaryStats
function renderSummaryStats(container, config, eventsData) {
    const { filtered, prev } = smartFilter(eventsData, config);
    const total = filtered.length;
    const booked = filtered.filter(e => e.status === 'записан').length;
    const spent = filtered.reduce((sum,e) => sum + e.spent, 0);
    const conversion = total > 0 ? (booked / total * 100) : 0;
    const avgCheck = total > 0 ? spent / total : 0;

    // Дельты к предыдущему периоду.
    const pTotal = prev.length;
    const pBooked = prev.filter(e => e.status === 'записан').length;
    const pSpent = prev.reduce((sum,e) => sum + e.spent, 0);
    const dTotal = calcDelta(total, pTotal);
    const dConversion = calcDelta(total > 0 ? booked/total*100 : 0, pTotal > 0 ? pBooked/pTotal*100 : 0);
    const dAvg = calcDelta(avgCheck, pTotal > 0 ? pSpent/pTotal : 0);

    container.innerHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Обращений</div>
                <div class="summary-value" id="total-value">0</div>
                <div class="summary-delta" id="total-delta">0%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Конверсия</div>
                <div class="summary-value" id="conv-value">0%</div>
                <div class="summary-delta" id="conv-delta">0%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Средний чек</div>
                <div class="summary-value" id="avg-value">0 ₽</div>
                <div class="summary-delta" id="avg-delta">0%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Выручка</div>
                <div class="summary-value" id="revenue-value">0 ₽</div>
                <div class="summary-delta" id="revenue-delta">0%</div>
            </div>
        </div>
    `;

    // Анимация счётов
    const totalEl = container.querySelector('#total-value');
    const convEl = container.querySelector('#conv-value');
    const avgEl = container.querySelector('#avg-value');
    const revEl = container.querySelector('#revenue-value');
    if (totalEl) animateCounter(totalEl, total);
    if (convEl) animateCounter(convEl, conversion, '%');
    if (avgEl) animateCounter(avgEl, avgCheck, ' ₽', 0);
    if (revEl) animateCounter(revEl, spent, ' ₽');

    // Дельты
    container.querySelector('#total-delta').innerHTML = deltaHtml(dTotal, true);
    container.querySelector('#conv-delta').innerHTML = deltaHtml(dConversion, true);
    container.querySelector('#avg-delta').innerHTML = deltaHtml(dAvg, true);
    container.querySelector('#revenue-delta').innerHTML = deltaHtml(calcDelta(spent, pSpent), true);
}

// Восстановленная функция renderHourlyActivity
function renderHourlyActivity(container, config, eventsData) {
    const { filtered } = smartFilter(eventsData, config);
    const hourlyCounts = new Array(24).fill(0);
    filtered.forEach(e => {
        const hour = parseInt(e.time.split(':')[0], 10);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
            hourlyCounts[hour]++;
        }
    });

    const hasData = hourlyCounts.some(c => c > 0);
    const peakHour = hasData ? hourlyCounts.indexOf(Math.max(...hourlyCounts)) : -1;

    const summary = document.createElement('div');
    summary.className = 'widget-insight';
    summary.innerHTML = hasData && peakHour >= 0
        ? `Пик активности — <strong>${peakHour.toString().padStart(2, '0')}:00</strong>`
        : 'Пока нет обращений — график заполнится автоматически';
    container.appendChild(summary);

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            datasets: [{ data: hourlyCounts, backgroundColor: hourlyCounts.map((c, i) => i === peakHour ? '#FF8F00' : '#005FF9') }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    chartInstances['hourly-activity'] = { main: chart };
}

// Восстановленная функция renderRecentCallsTable
function renderRecentCallsTable(container, config, eventsData) {
    const count = config.count || 5;
    const { filtered } = smartFilter(eventsData, config);
    const sorted = [...filtered].sort((a,b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)).slice(0, count);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="widget-empty-state soft"><span class="widget-empty-icon"></span><p>Пока нет обращений<br>Появятся после первых звонков.</p></div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'recent-calls-table';
    table.innerHTML = `
        <thead>
            <tr><th>Клиент</th><th>Услуга</th><th>Дата</th><th>Статус</th></tr>
        </thead>
        <tbody>
            ${sorted.map(e => `
                <tr class="calls-table-row" data-event-id="${e.id}">
                    <td>${e.client}</td>
                    <td>${e.service}</td>
                    <td>${e.date.slice(5)} ${e.time}</td>
                    <td><span class="status ${e.status === 'записан' ? 'success' : e.status === 'отказ' ? 'danger' : 'warning'}">${e.status}</span></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);

    // Обработчик клика по строке таблицы
    table.querySelectorAll('.calls-table-row').forEach(row => {
        row.addEventListener('click', () => {
            const eventId = row.getAttribute('data-event-id');
            openEventModal(eventId);
        });
    });
}

// Восстановленная функция renderConversionFunnel
function renderConversionFunnel(container, config, eventsData) {
    const { filtered } = smartFilter(eventsData, config);
    const total = filtered.length;
    const contacted = filtered.filter(e => e.status !== 'не записан').length; // Любой статус кроме "не записан"
    const booked = filtered.filter(e => e.status === 'записан').length;
    const failure = filtered.filter(e => e.status === 'отказ').length;

    const data = [total, contacted, booked]; // Убираем отказ из воронки, она показывает успех
    const labels = ['Получено', 'Контакт', 'Записан'];

    const canvas = document.createElement('canvas');
    canvas.height = 200;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Рисуем вручную, так как Chart.js не идеален для воронки
    const chart = new Chart(ctx, {
        type: 'bar', // Используем bar, но с хитрыми настройками для эффекта воронки
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#005FF9', '#5D8BF4', '#2E7D32'],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false }, // Скрываем ось X
                y: {
                    // Настройка ширины столбцов для создания эффекта воронки
                    afterFit: (scale) => {
                        // Это хак, Chart.js не поддерживает трапеции напрямую
                        // Правильная воронка потребовала бы custom plugin или другую библиотеку
                        // Для демонстрации подходит и горизонтальный bar chart
                    },
                    ticks: { mirror: true, labelOffset: 10 }
                }
            }
        }
    });
    chartInstances['conversion-funnel'] = { main: chart };
}

// Восстановленная функция renderTopClients
function renderTopClients(container, config, eventsData) {
    const count = config.count || 5;
    const { filtered } = smartFilter(eventsData, config);
    const clientCounts = {};
    filtered.forEach(e => {
        clientCounts[e.client] = (clientCounts[e.client] || 0) + 1;
    });
    const sorted = Object.entries(clientCounts).sort((a,b) => b[1] - a[1]).slice(0, count);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="widget-empty-state soft"><span class="widget-empty-icon"></span><p>Пока нет обращений от клиентов<br>Появятся после первых взаимодействий.</p></div>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'top-clients-list';
    sorted.forEach(([client, num]) => {
        const item = document.createElement('li');
        item.className = 'top-client-item';
        item.innerHTML = `<div class="top-client-name">${client}</div><div class="top-client-count">${num} обращ.${num > 1 ? 'ений' : 'ение'}</div>`;
        list.appendChild(item);
    });
    container.appendChild(list);
}

// ========== МОДАЛКИ ==========
function openEventModal(eventId) {
    const event = window.events.find(e => e.id === eventId);
    if (!event) return;
    const modal = document.getElementById('event-modal');
    document.getElementById('event-details').innerHTML = `
        <div><strong>Имя:</strong> ${event.client}</div>
        <div><strong>Телефон:</strong> ${event.phone}</div>
        <div><strong>Дата:</strong> ${event.date} ${event.time}</div>
        <div><strong>Статус:</strong> ${event.status}</div>
        <div><strong>Услуга:</strong> ${event.service}</div>
        <div><strong>Сумма:</strong> ${event.spent} ₽</div>
        <div><strong>Транскрипция:</strong> <pre>${event.transcript}</pre></div>
    `;
    modal.style.display = 'flex';
}

function readSetting(id) {
    const el = document.getElementById(id);
    return el ? el.value : null;
}

// Уникальные параметры настройки для каждого типа виджета.
function buildSettingsForm(widgetId, config) {
    const section = WIDGET_TYPES_INFO[widgetId]?.section || 'chart';
    const sel = (id, options, selected, label) => `
        <div class="form-group">
            <label for="${id}">${label}</label>
            <select id="${id}" class="widget-settings-select">
                ${options.map(o => `<option value="${o.value}" ${o.value===selected?'selected':''}>${o.label}</option>`).join('')}
            </select>
        </div>`;
    // Бегунок (без поля ввода текста/цифр) с живым отображением значения.
    const num = (id, val, min, max, label) => `
        <div class="form-group">
            <label for="${id}">${label}</label>
            <div class="widget-range-row">
                <input type="range" id="${id}" min="${min}" max="${max}" step="1" value="${val}" class="widget-settings-range">
                <span class="range-value" id="${id}-value">${val}</span>
            </div>
        </div>`;
    const periodOpts = [
        { value: 'today', label: 'Сегодня' },
        { value: 'week', label: 'Неделя' },
        { value: 'month', label: 'Месяц' },
        { value: 'quarter', label: 'Квартал' },
        { value: 'all', label: 'Всё время' }
    ];
    const statusOpts = [
        { value: 'all', label: 'Все статусы' },
        { value: 'записан', label: 'Записан' },
        { value: 'не записан', label: 'Не записан' },
        { value: 'отказ', label: 'Отказ' }
    ];
    const intervalOpts = [
        { value: 'hour', label: 'По часам' },
        { value: 'day', label: 'По дням' },
        { value: 'week', label: 'По неделям' }
    ];
    const layoutOpts = [
        { value: 'bar', label: 'Столбцы' },
        { value: 'line', label: 'Линия' },
        { value: 'area', label: 'Область' }
    ];

    let html = '<div class="widget-settings-section">';
    switch (widgetId) {
        case 'unbooked-trend':
            html += num('days-input', config.days || 7, 3, 30, 'Период (дней)');
            html += sel('status-input', statusOpts, config.status || 'all', 'Статус');
            html += sel('layout-input', layoutOpts, config.layout || 'line', 'Тип диаграммы');
            break;
        case 'distribution-chart':
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            html += sel('status-input', statusOpts, config.status || 'all', 'Статус');
            break;
        case 'weekly-bar':
            html += sel('period-input', periodOpts, config.period || 'week', 'Период');
            html += sel('interval-input', intervalOpts, config.interval || 'day', 'Группировка');
            break;
        case 'hourly-activity':
            html += sel('period-input', periodOpts, config.period || 'week', 'Период');
            html += sel('layout-input', layoutOpts, config.layout || 'line', 'Тип диаграммы');
            break;
        case 'conversion-funnel':
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            html += num('steps-input', config.steps || 4, 2, 8, 'Число шагов воронки');
            break;
        case 'top-services':
            html += num('count-input', config.count || 5, 1, 15, 'Показывать услуг');
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            break;
        case 'spent-counter':
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            html += sel('status-input', statusOpts, config.status || 'all', 'Статус');
            break;
        case 'summary-stats':
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            html += num('cards-input', config.cards || 3, 1, 6, 'Число показателей');
            break;
        case 'recent-clients':
            html += num('count-input', config.count || 3, 1, 15, 'Показывать клиентов');
            html += sel('status-input', statusOpts, config.status || 'all', 'Статус');
            break;
        case 'recent-calls-table':
            html += num('count-input', config.count || 5, 1, 20, 'Показывать записей');
            html += sel('period-input', periodOpts, config.period || 'week', 'Период');
            break;
        case 'top-clients':
            html += num('count-input', config.count || 5, 1, 15, 'Показывать клиентов');
            html += sel('period-input', periodOpts, config.period || 'month', 'Период');
            break;
        case 'mini-calendar':
            html += sel('period-input', periodOpts, config.period || 'month', 'Отображать период');
            break;
        default:
            html += `<p class="form-hint">Дополнительных параметров для этого виджета нет.</p>`;
    }
    html += '</div>';
    return html;
}

function collectSettings(widgetId) {
    const cfg = {};
    const g = id => document.getElementById(id) ? document.getElementById(id).value : null;
    switch (widgetId) {
        case 'unbooked-trend':
            cfg.days = parseInt(g('days-input')) || 7;
            cfg.status = g('status-input') || 'all';
            cfg.layout = g('layout-input') || 'line';
            break;
        case 'distribution-chart':
            cfg.period = g('period-input') || 'month';
            cfg.status = g('status-input') || 'all';
            break;
        case 'weekly-bar':
            cfg.period = g('period-input') || 'week';
            cfg.interval = g('interval-input') || 'day';
            break;
        case 'hourly-activity':
            cfg.period = g('period-input') || 'week';
            cfg.layout = g('layout-input') || 'line';
            break;
        case 'conversion-funnel':
            cfg.period = g('period-input') || 'month';
            cfg.steps = parseInt(g('steps-input')) || 4;
            break;
        case 'top-services':
            cfg.count = parseInt(g('count-input')) || 5;
            cfg.period = g('period-input') || 'month';
            break;
        case 'spent-counter':
            cfg.period = g('period-input') || 'month';
            cfg.status = g('status-input') || 'all';
            break;
        case 'summary-stats':
            cfg.period = g('period-input') || 'month';
            cfg.cards = parseInt(g('cards-input')) || 3;
            break;
        case 'recent-clients':
            cfg.count = parseInt(g('count-input')) || 3;
            cfg.status = g('status-input') || 'all';
            break;
        case 'recent-calls-table':
            cfg.count = parseInt(g('count-input')) || 5;
            cfg.period = g('period-input') || 'week';
            break;
        case 'top-clients':
            cfg.count = parseInt(g('count-input')) || 5;
            cfg.period = g('period-input') || 'month';
            break;
        case 'mini-calendar':
            cfg.period = g('period-input') || 'month';
            break;
    }
    return cfg;
}

function openWidgetSettingsModal(widgetId, widgetElement, widget) {
    const modal = document.getElementById('widget-modal');
    const form = document.getElementById('widget-settings-form');
    const config = { ...DEFAULT_WIDGET_CONFIGS[widgetId], ...widgetConfigs[widgetId] };

    let html = `<input type="hidden" id="widget-id-input" value="${widgetId}">`;
    html += `<div class="widget-settings-title">${WIDGET_TYPES_INFO[widgetId]?.previewSvg || ''} ${getWidgetName(widgetId)}</div>`;
    html += buildSettingsForm(widgetId, config);
    form.innerHTML = html;

    // Живое значение для всех бегунков (без полей ввода)
    form.querySelectorAll('.widget-settings-range').forEach(r => {
        const valEl = form.querySelector('#' + r.id + '-value');
        const sync = () => { if (valEl) valEl.textContent = r.value; };
        r.addEventListener('input', sync);
        sync();
    });

    modal.style.display = 'flex';

    document.getElementById('save-widget-settings').onclick = () => {
        const wId = document.getElementById('widget-id-input').value;
        const newConfig = collectSettings(wId);
        widgetConfigs[wId] = { ...widgetConfigs[wId], ...newConfig };
        // После настройки виджет становится «настроенным» и начинает показывать данные.
        if (widget) widget.configured = true;
        saveConfigs();
        saveLayout();
        renderDashboard();
        closeModals();
    };
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// ========== УПРАВЛЕНИЕ ВИДЖЕТАМИ ==========
function removeWidget(rowId, widgetIndex) {
    const row = dashboardLayout.rows.find(r => r.id === rowId);
    if (!row) return;
    row.widgets.splice(widgetIndex, 1);
    if (row.widgets.length === 0) {
        dashboardLayout.rows = dashboardLayout.rows.filter(r => r !== row);
    }
    saveLayout();
    renderDashboard();
}

// SVG-иконки категорий для табов в модалке выбора виджета (без эмодзи).
const WIDGET_SECTION_ICONS = {
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-5 3 3 5-6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
    counter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 11v5M16 9v7"/></svg>',
    schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/><circle cx="8" cy="14" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>'
};

// Текущее состояние фильтров модалки выбора виджета.
let widgetPickerState = { section: 'all', query: '' };

// Плоский список всех доступных id виджетов.
function getAllWidgetTypeIds() {
    return Object.keys(WIDGET_TYPES_INFO);
}

// Множество id виджетов, уже размещённых на дашборде.
function getAddedWidgetIds() {
    const set = new Set();
    (dashboardLayout.rows || []).forEach(row => {
        (row.widgets || []).forEach(w => set.add(w.widgetId));
    });
    return set;
}

// Собирает виджеты по активной категории и строке поиска.
function getFilteredWidgetIds() {
    const query = widgetPickerState.query.trim().toLowerCase();
    return getAllWidgetTypeIds().filter(id => {
        const info = WIDGET_TYPES_INFO[id];
        const sectionOk = widgetPickerState.section === 'all' || info.section === widgetPickerState.section;
        if (!sectionOk) return false;
        if (!query) return true;
        const haystack = `${getWidgetName(id)} ${info.description} ${WIDGET_SECTIONS[info.section] || ''}`.toLowerCase();
        return haystack.includes(query);
    });
}

function renderWidgetPickerTabs() {
    const tabsEl = document.getElementById('widget-picker-tabs');
    tabsEl.innerHTML = '';

    const allTab = document.createElement('button');
    allTab.type = 'button';
    allTab.className = 'widget-picker-tab' + (widgetPickerState.section === 'all' ? ' active' : '');
    allTab.textContent = `Все (${getAllWidgetTypeIds().length})`;
    allTab.onclick = () => { widgetPickerState.section = 'all'; renderWidgetPickerTabs(); renderWidgetTypeCards(); };
    tabsEl.appendChild(allTab);

    WIDGET_SECTION_ORDER.forEach(section => {
        const count = getAllWidgetTypeIds().filter(id => WIDGET_TYPES_INFO[id].section === section).length;
        if (count === 0) return;
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'widget-picker-tab' + (widgetPickerState.section === section ? ' active' : '');
        tab.innerHTML = `${WIDGET_SECTION_ICONS[section] || ''} ${WIDGET_SECTIONS[section] || section} (${count})`;
        tab.onclick = () => { widgetPickerState.section = section; renderWidgetPickerTabs(); renderWidgetTypeCards(); };
        tabsEl.appendChild(tab);
    });
}

function renderWidgetTypeCards() {
    const list = document.getElementById('widget-types-list');
    list.innerHTML = '';
    const ids = getFilteredWidgetIds();

    if (ids.length === 0) {
        list.innerHTML = '<div class="widget-picker-empty">Ничего не найдено. Попробуйте изменить запрос.</div>';
        return;
    }

    ids.forEach(id => {
        const info = WIDGET_TYPES_INFO[id];
        const card = document.createElement('div');
        card.className = 'widget-type-item';
        card.innerHTML = `
            <div class="widget-type-head">
                <span class="widget-type-icon">${info.previewSvg || ''}</span>
                <h4>${getWidgetName(id)}</h4>
            </div>
            <p>${info.description}</p>
            <div class="widget-type-footer">
                <span class="widget-type-badge">${WIDGET_SECTIONS[info.section] || 'Прочее'}</span>
                <button type="button" class="widget-type-add-btn">Добавить</button>
            </div>
        `;
        const btn = card.querySelector('.widget-type-add-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addWidgetToLayout(id);
            closeModals();
        });
        card.addEventListener('click', () => {
            addWidgetToLayout(id);
            closeModals();
        });
        list.appendChild(card);
    });
}

function openAddWidgetModal() {
    const modal = document.getElementById('add-widget-modal');
    widgetPickerState = { section: 'all', query: '' };

    const searchInput = document.getElementById('widget-picker-search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = (e) => {
            widgetPickerState.query = e.target.value;
            renderWidgetTypeCards();
        };
    }

    renderWidgetPickerTabs();
    renderWidgetTypeCards();
    modal.style.display = 'flex';

    if (searchInput) setTimeout(() => searchInput.focus(), 50);
}

function addWidgetToLayout(widgetId) {
    const placement = window.widgetPlacementInfo;
    window.widgetPlacementInfo = null;
    // Новый виджет ничего не показывает, пока пользователь его не настроит.
    const newWidget = { widgetId, configured: false };

    // Вставка нового ряда перед указанным (через чёрную полоску-разделитель).
    if (placement && placement.beforeRowId) {
        const idx = dashboardLayout.rows.findIndex(r => r.id === placement.beforeRowId);
        const pos = idx === -1 ? dashboardLayout.rows.length : idx;
        dashboardLayout.rows.splice(pos, 0, { id: `row-${Date.now()}`, widgets: [newWidget] });
    }
    // Вставка виджета в существующий ряд (на случай вызова из другого места).
    else if (placement && placement.rowId) {
        const row = dashboardLayout.rows.find(r => r.id === placement.rowId);
        if (row) {
            const pos = placement.position !== undefined ? placement.position : row.widgets.length;
            row.widgets.splice(pos, 0, newWidget);
        } else {
            dashboardLayout.rows.push({ id: `row-${Date.now()}`, widgets: [newWidget] });
        }
    }
    // По умолчанию — добавить в первый ряд.
    else {
        const first = dashboardLayout.rows[0];
        if (first) {
            first.widgets.push(newWidget);
        } else {
            dashboardLayout.rows.push({ id: `row-${Date.now()}`, widgets: [newWidget] });
        }
    }
    saveLayout();
    renderDashboard();
}

// Восстановление макета и настроек виджетов по умолчанию.
function restoreDefaultDashboard() {
    if (!window.confirm('Восстановить дашборд по умолчанию?')) return;
    dashboardLayout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    widgetConfigs = JSON.parse(JSON.stringify(DEFAULT_WIDGET_CONFIGS));
    saveLayout();
    saveConfigs();
    renderDashboard();
}

// ========== РЕЖИМ РЕДАКТИРОВАНИЯ ==========
function toggleEditMode() {
    isEditMode = !isEditMode;
    updateEditModeUI();
    renderDashboard();
    setupDragAndDrop();
}

function updateEditModeUI() {
    const btn = document.getElementById('edit-mode-toggle');
    if (btn) btn.textContent = isEditMode ? 'Сохранить изменения' : 'Настроить дашборд';
    document.body.classList.toggle('edit-mode', isEditMode);
}

// ========== DRAG & DROP ==========
// Кастомный движок (Pointer Events + превью) подключается из static/js/dashboard-dnd.js.
function setupDragAndDrop() {
    if (!window.DashboardDnDEngine) return;
    window.DashboardDnDEngine.destroy();
    if (!isEditMode) return;
    window.DashboardDnDEngine.init();
}

// Перемещение виджета между/внутри рядов. В flex-модели соседние виджеты
// автоматически пересчитывают ширину (50/50, 1/3 и т.д.) после вставки.
function moveWidget(fromRowId, fromIdx, toRowId, toIndex) {
    const fromRow = dashboardLayout.rows.find(r => r.id === fromRowId);
    const toRow = dashboardLayout.rows.find(r => r.id === toRowId);
    if (!fromRow || !toRow) return;
    const widget = fromRow.widgets[fromIdx];
    if (!widget) return;

    fromRow.widgets.splice(fromIdx, 1);

    // При переносе в другой ряд опустевший исходный ряд удаляем автоматически.
    if (fromRowId !== toRowId && fromRow.widgets.length === 0) {
        dashboardLayout.rows = dashboardLayout.rows.filter(r => r !== fromRow);
    }

    // toIndex приходит из движка как индекс в текущем списке виджетов ряда.
    // При перемещении внутри одного ряда позиция корректируется после удаления.
    let idx = parseInt(toIndex) || 0;
    if (fromRowId === toRowId && idx > fromIdx) idx -= 1;
    idx = Math.max(0, Math.min(idx, toRow.widgets.length));

    toRow.widgets.splice(idx, 0, widget);
    saveLayout();
    renderDashboard();
}

// Публичный API для движка перетаскивания.
window.DashboardDnD = {
    getCategory: (widgetId) => getWidgetCategory(widgetId),
    getCategoryLabel: (cat) => CATEGORY_LABELS[cat] || 'Прочее',
    moveWidget,
    addWidget: addWidgetToLayout,
    openAddWidgetModal,
    save: saveLayout,
    render: renderDashboard,
    isEditMode: () => isEditMode
};

// ========== ПЕРИОД ==========
function handlePeriodChange() {
    const period = document.getElementById('periodSelector').value;
    window.currentPeriod = period;
    window.filteredEvents = window.filterEventsByPeriod(window.events, period);
    renderDashboard();
}

// ========== ЗАКРЫТИЕ МОДАЛОК ==========
// Надёжное закрытие окон/плашек: по крестику, клику вне плашки и по Escape.
// Работает напрямую на элементах, а не только через всплытие, поэтому
// не зависит от случайных stopPropagation в других обработчиках.
// Функция идемпотентна: повторные вызовы не плодят дубли обработчиков.
function bindModalDismiss() {
    if (window.__modalDismissBound) return;
    window.__modalDismissBound = true;

    // 1) Крестик любого модального окна.
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // 2) Клик по затемнённому фону (сама плашка .modal, вне .modal-content).
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            // Закрываем только если кликнули именно по фону, а не по содержимому.
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    // 3) Escape закрывает открытую модалку.
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display !== 'none') modal.style.display = 'none';
        });
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ==========
function initEventListeners() {
    document.getElementById('edit-mode-toggle').addEventListener('click', toggleEditMode);
    document.getElementById('restore-defaults').addEventListener('click', restoreDefaultDashboard);
    document.getElementById('periodSelector').addEventListener('change', handlePeriodChange);

    bindModalDismiss();

    setupDragAndDrop();
}

// Запуск
document.addEventListener('DOMContentLoaded', initDashboard);