// static/js/dashboard-dnd.js
// Подключение локальной библиотеки Sortable (static/js/sortable.js) к дашборду.
//
// Дашборд — колонка flex-рядов. Внутри ряда виджеты делят ширину поровну
// (flex: 1 1 0): два виджета → 50/50, три → по трети; у всех одинаковая высота.
//
// Перетаскивание работает только в режиме редактирования и использует Pointer
// Events (не нативный HTML5 DnD) — благодаря этому во время перетаскивания
// можно задать свой курсор «держит объект» и скрыть копию виджета.
// «Призрачная» копия не создаётся: исходный виджет подсвечивается, а место
// вставки показывает тонкий индикатор (см. sortable.js и style_2.css).
//
// Движок полагается на публичный API window.DashboardDnD из overview.js
// (moveWidget / isEditMode). После перестановки виджетов обновляется макет.

(function () {
    if (window.DashboardDnDEngine) return;

    let sortable = null;
    const LIST_SELECTOR = '#dashboard-rows';
    const ROW_CONTAINER = '.row-grid';

    // Создаём экземпляр Sortable один раз на постоянном контейнере #dashboard-rows.
    // renderDashboard() перерисовывает содержимое, но сам контейнер сохраняется,
    // поэтому обработчики не теряются.
    function init() {
        if (sortable) return;
        if (!window.Sortable || !window.DashboardDnD) return;
        const list = document.querySelector(LIST_SELECTOR);
        if (!list) return;

        sortable = new window.Sortable(list, {
            draggable: '.widget',
            container: ROW_CONTAINER,
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-dragging',
            onChange(payload) {
                const fromRowId = payload.sourceContainer.dataset.rowId;
                const toRowId = payload.targetContainer.dataset.rowId;
                window.DashboardDnD.moveWidget(fromRowId, payload.sourceIndex, toRowId, payload.targetIndex);
            }
        });
    }

    function destroy() {
        if (sortable) { sortable.destroy(); sortable = null; }
    }

    window.DashboardDnDEngine = { init, destroy };
})();