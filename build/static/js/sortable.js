// static/js/sortable.js
// Локальная мини-реализация алгоритма SortableJS (без внешних зависимостей / CDN).
//
// Что делает:
//   - перетаскивание элементов списка при помощи Pointer Events;
//   - поддержка нескольких контейнеров (rows) в рамках одной «группы»;
//   - перетаскиваемый виджет остаётся на месте (помечается классом chosen),
//     а сама «призрачная» копия НЕ создаётся — во время перетаскивания меняется
//     только курсор (иконка «держит объект») и подсвечивается исходный виджет;
//   - положение вставки показывается тонким индикатором, БЕЗ встраивания
//     какого-либо превью-элемента в раскладку (нет «предпросмотра виджета»);
//   - при отпускании вызывается колбэк onChange({sourceContainer, sourceIndex,
//     targetContainer, targetIndex}), который решает, как применить перемещение.
//
// Использование:
//   new Sortable(listEl, {
//       draggable: '.widget',        // селектор перетаскиваемых элементов
//       container: '.row-grid',      // селектор целевых контейнеров (для переноса между рядами)
//       chosenClass: 'sortable-chosen',
//       ghostClass: 'sortable-ghost',
//       dragClass: 'sortable-dragging',   // вешается на <body> во время перетаскивания
//       onChange(payload) { ... }
//   });

(function (global) {
    'use strict';

    if (global.Sortable) return;

    const DEFAULT_OPTIONS = {
        draggable: '.sortable-item',
        container: '.row-grid',
        group: 'shared',
        handle: null,
        chosenClass: 'sortable-chosen',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-dragging',
        threshold: 5,
        onChange: null
    };

    function closest(el, selector) {
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            if (n.matches && n.matches(selector)) return n;
        }
        return null;
    }

    function getItems(container, draggable) {
        return Array.from(container.children).filter(c => c.matches && c.matches(draggable));
    }

    // Индекс вставки внутри горизонтального flex-ряда по координате X курсора.
    function computeIndex(container, clientX, draggable) {
        const items = getItems(container, draggable);
        if (items.length === 0) return 0;
        for (let i = 0; i < items.length; i++) {
            const r = items[i].getBoundingClientRect();
            if (clientX < r.left + r.width / 2) return i;
        }
        return items.length;
    }

    // Общий сеанс перетаскивания: одновременно может быть только один.
    let session = null;

    function isSource(target, opts) {
        if (!closest(target, opts.draggable)) return false;
        if (opts.handle && !closest(target, opts.handle)) return false;
        // Не начинаем перетаскивание с кнопок внутри виджета (⚙, ✕ и т.п.).
        if (closest(target, 'button')) return false;
        return true;
    }

    function beginDrag() {
        const s = session;
        // Не показываем «призрачную» копию виджета: подсвечиваем исходный
        // виджет и меняем курсор (иконка «держит объект» задаётся в CSS).
        s.sourceItem.classList.add(s.opts.chosenClass);
        document.body.classList.add(s.opts.dragClass);
    }

    // Индикатор будущей позиции виджета.
    // Используем РОВНО ТУ ЖЕ вертикальную полосу, что и при создании нового
    // виджета: создаём элемент с классом .widget-divider (синяя линия + кружок
    // «+»). Добавляем модификатор .sortable-indicator, который делает его
    // fixed-элементом поверх дашборда и всегда видимым. Индикатор НЕ встраивается
    // в раскладку ряда, поэтому соседние виджеты не сдвигаются.
    function clearIndicator() {
        const s = session;
        if (s.indicator && s.indicator.parentElement) {
            s.indicator.parentElement.removeChild(s.indicator);
        }
        s.indicator = null;
    }

    function updateIndicator(container, index) {
        const s = session;
        const items = getItems(container, s.opts.draggable);
        if (!s.indicator) {
            s.indicator = document.createElement('div');
            s.indicator.className = 'widget-divider sortable-indicator';
            s.indicator.innerHTML = '<span class="row-divider-plus">+</span>';
            document.body.appendChild(s.indicator);
        }
        const rect = container.getBoundingClientRect();

        // Зазор между виджетами в flex-ряду (см. .row-grid { gap: 16px }).
        // Нужен, чтобы в крайних позициях полоса не прижималась вплотную к виджету,
        // а занимала «свой» слот посередине свободного промежутка.
        const gap = Math.min(16, rect.width * 0.05);

        // Точка вставки по X: перед первым виджетом → посередине левого зазора;
        // после последнего → посередине правого зазора; между двумя виджетами →
        // середина промежутка. В любом случае полоса стоит в центре «слота».
        // Дополнительный отступ, чтобы полоса на краях ряда отстояла дальше от виджетов.
        const edgePad = 10;
        let x;
        if (items.length === 0) {
            x = rect.left + gap;
        } else if (index <= 0) {
            x = items[0].getBoundingClientRect().left - gap - edgePad;
        } else if (index >= items.length) {
            x = items[items.length - 1].getBoundingClientRect().right + gap + edgePad;
        } else {
            const prev = items[index - 1].getBoundingClientRect();
            const next = items[index].getBoundingClientRect();
            x = (prev.right + next.left) / 2;
        }

        s.indicator.style.left = (x - 9) + 'px'; // центрируем полосу относительно слота
        s.indicator.style.top = rect.top + 'px';
        s.indicator.style.height = rect.height + 'px';
    }

    function onDown(e) {
        if (session) return;
        const opts = this.opts;
        if (!isSource(e.target, opts)) return;
        const item = closest(e.target, opts.draggable);

        session = {
            opts,
            sourceItem: item,
            sourceContainer: item.parentElement,
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            lastY: e.clientY,
            moved: false,
            indicator: null,
            targetContainer: null,
            targetIndex: -1
        };

        try { item.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        e.preventDefault();
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onCancel);
    }

    function onMove(e) {
        const s = session;
        if (!s || e.pointerId !== s.pointerId) return;
        s.lastX = e.clientX;
        s.lastY = e.clientY;

        if (!s.moved) {
            if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) < s.opts.threshold) return;
            s.moved = true;
            beginDrag();
        }

        const el = document.elementFromPoint(e.clientX, e.clientY);
        const container = el ? closest(el, s.opts.container) : null;
        s.targetContainer = container;
        if (container) {
            s.targetIndex = computeIndex(container, e.clientX, s.opts.draggable);
            updateIndicator(container, s.targetIndex);
        } else {
            s.targetIndex = -1;
            clearIndicator();
        }
    }

    function onUp(e) {
        const s = session;
        if (!s || e.pointerId !== s.pointerId) return;
        const changed = s.moved && s.targetContainer && s.targetIndex >= 0;

        cleanup();

        if (changed && s.opts.onChange) {
            const sourceIndex = getItems(s.sourceContainer, s.opts.draggable).indexOf(s.sourceItem);
            s.opts.onChange({
                sourceContainer: s.sourceContainer,
                sourceIndex: Math.max(0, sourceIndex),
                targetContainer: s.targetContainer,
                targetIndex: s.targetIndex
            });
        }
    }

    function onCancel() {
        if (!session) return;
        cleanup();
    }

    function cleanup() {
        const s = session;
        if (!s) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onCancel);

        if (s.sourceItem) s.sourceItem.classList.remove(s.opts.chosenClass);
        clearIndicator();
        document.body.classList.remove(s.opts.dragClass);
        session = null;
    }

    function Sortable(el, options) {
        this.el = el;
        this.opts = Object.assign({}, DEFAULT_OPTIONS, options);
        this._onDown = onDown.bind(this);
        this.el.addEventListener('pointerdown', this._onDown);
    }

    Sortable.prototype.destroy = function () {
        this.el.removeEventListener('pointerdown', this._onDown);
        if (session) cleanup();
    };

    global.Sortable = Sortable;
})(window);