// static/js/calendar.js
// Календарь в стиле Google Calendar: виды День / Неделя / Месяц, навигация,
// цветные блоки событий. Данные берутся из window.events (data.js).
(function() {
    'use strict';

    // ---------- Состояние ----------
    var state = {
        view: 'week',      // 'day' | 'week' | 'month'
        anchor: new Date() // день/неделя/месяц, содержащие эту дату
    };

    var WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    var MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    // ---------- Утилиты дат ----------
    function toDateStr(d) {
        var y = d.getFullYear();
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return y + '-' + m + '-' + day;
    }
    function startOfWeek(d) {
        var copy = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
        var dow = (copy.getDay() + 6) % 7; // Пн=0
        copy.setDate(copy.getDate() - dow);
        return copy;
    }
    function addDays(d, n) {
        var copy = new Date(d);
        copy.setDate(copy.getDate() + n);
        return copy;
    }
    function todayStr() { return toDateStr(new Date()); }

    // ---------- Данные ----------
    function events() {
        return window.events || [];
    }
    function eventsForDate(dateStr) {
        return events().filter(function(e) { return e.date === dateStr; })
                        .sort(function(a, b) { return a.time < b.time ? -1 : 1; });
    }
    function statusClass(status) {
        if (status === 'не записан') return 'st-notbooked';
        if (status === 'отказ') return 'st-refused';
        return '';
    }

    // ---------- DOM ----------
    var weekView, dayView, monthView, periodLabel;

    document.addEventListener('DOMContentLoaded', function() {
        weekView = document.getElementById('weekView');
        dayView = document.getElementById('dayView');
        monthView = document.getElementById('monthView');
        periodLabel = document.getElementById('periodLabel');
        var todayButton = document.getElementById('todayBtn');
        var previousButton = document.getElementById('navPrev');
        var nextButton = document.getElementById('navNext');

        if (!weekView || !dayView || !monthView || !periodLabel ||
                !todayButton || !previousButton || !nextButton) return;

        todayButton.addEventListener('click', function() {
            state.anchor = new Date();
            render();
        });
        previousButton.addEventListener('click', function() { shift(-1); });
        nextButton.addEventListener('click', function() { shift(1); });

        var radios = document.querySelectorAll('input[name="calView"]');
        Array.prototype.forEach.call(radios, function(r) {
            r.addEventListener('change', function() {
                if (r.checked) {
                    state.view = r.value;
                    // При переключении в неделю/месяц показываем текущую точку
                    if (state.view === 'week') state.anchor = startOfWeek(state.anchor);
                    if (state.view === 'month') state.anchor = new Date(state.anchor.getFullYear(), state.anchor.getMonth(), 1, 12);
                    render();
                }
            });
        });

        setupModalClose();
        render();
        renderClientsPanel();
        bindClientsPanel();
    });

    function shift(dir) {
        var d = state.anchor;
        if (state.view === 'day') state.anchor = addDays(d, dir);
        else if (state.view === 'week') state.anchor = addDays(startOfWeek(d), dir * 7);
        else state.anchor = new Date(d.getFullYear(), d.getMonth() + dir, 1, 12);
        render();
    }

    // ---------- Рендер ----------
    function render() {
        if (!weekView) return;
        weekView.hidden = state.view !== 'week';
        dayView.hidden = state.view !== 'day';
        monthView.hidden = state.view !== 'month';
        periodLabel.textContent = periodTitle();
        if (state.view === 'week') renderWeek();
        else if (state.view === 'day') renderDay();
        else renderMonth();
    }

    function periodTitle() {
        var d = state.anchor;
        if (state.view === 'day') {
            return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
        }
        if (state.view === 'week') {
            var start = startOfWeek(d);
            var end = addDays(start, 6);
            var label = '';
            if (start.getMonth() === end.getMonth()) {
                label = start.getDate() + '–' + end.getDate() + ' ' + MONTHS[start.getMonth()];
            } else {
                label = start.getDate() + ' ' + MONTHS[start.getMonth()] + ' – ' +
                        end.getDate() + ' ' + MONTHS[end.getMonth()];
            }
            return label + ' ' + end.getFullYear();
        }
        return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    }

    // ===== Недельный вид =====
    function renderWeek() {
        var start = startOfWeek(state.anchor);
        var today = todayStr();
        var dates = [];
        for (var i = 0; i < 7; i++) dates.push(addDays(start, i));

        var html = '<div class="week-grid">';
        // Пустая ячейка в углу
        html += '<div class="week-head"></div>';
        dates.forEach(function(d) {
            var ds = toDateStr(d);
            var isToday = ds === today;
            html += '<div class="week-head' + (isToday ? ' cal-today' : '') + '">' +
                    WEEKDAYS[(d.getDay() + 6) % 7] +
                    '<strong>' + d.getDate() + '</strong></div>';
        });
        for (var h = 0; h < 24; h++) {
            html += '<div class="week-time">' + h + ':00</div>';
            for (var j = 0; j < 7; j++) {
                var cellDate = toDateStr(dates[j]);
                var isCellToday = cellDate === today;
                html += '<div class="week-cell' + (isCellToday ? ' is-today' : '') + '">' +
                        blocksHtml(eventsForDate(cellDate), h) +
                        '</div>';
            }
        }
        html += '</div>';
        weekView.innerHTML = html;
    }

    // ===== Дневной вид =====
    function renderDay() {
        var ds = toDateStr(state.anchor);
        var today = todayStr();
        var isToday = ds === today;
        var dayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][state.anchor.getDay()];

        var html = '<div class="day-grid">' +
            '<div class="week-head"></div>' +
            '<div class="week-head' + (isToday ? ' cal-today' : '') + '">' + dayName + ' <strong>' + state.anchor.getDate() + '</strong></div>';
        for (var h = 0; h < 24; h++) {
            html += '<div class="week-time">' + h + ':00</div>';
            html += '<div class="day-cell' + (isToday ? ' is-today' : '') + '">' +
                    blocksHtml(eventsForDate(ds), h) +
                    '</div>';
        }
        html += '</div>';
        dayView.innerHTML = html;
    }

    // ===== Месячный вид =====
    function renderMonth() {
        var year = state.anchor.getFullYear();
        var month = state.anchor.getMonth();
        var first = new Date(year, month, 1, 12);
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var offset = (first.getDay() + 6) % 7; // Пн=0
        var today = todayStr();

        var html = '<div class="month-grid">';
        WEEKDAYS.forEach(function(w) { html += '<div class="month-weekday">' + w + '</div>'; });
        for (var i = 0; i < offset; i++) html += '<div class="month-day empty"></div>';

        for (var day = 1; day <= daysInMonth; day++) {
            var ds = year + '-' + ('0' + (month + 1)).slice(-2) + '-' + ('0' + day).slice(-2);
            var isToday = ds === today;
            var dayEvents = eventsForDate(ds);
            html += '<div class="month-day' + (isToday ? ' cal-today' : '') + '" data-date="' + ds + '">' +
                '<div class="mday-num">' + day + '</div>';
            dayEvents.slice(0, 3).forEach(function(e) {
                html += '<div class="mday-item">' + e.time.slice(0, 5) + ' · ' + esc(e.client) + '</div>';
            });
            html += '</div>';
        }
        html += '</div>';
        monthView.innerHTML = html;

        // Клик по дню месячного вида открывает детальный просмотр (день)
        Array.prototype.forEach.call(monthView.querySelectorAll('.month-day:not(.empty)'), function(cell) {
            cell.addEventListener('click', function() {
                var parts = cell.dataset.date.split('-');
                state.anchor = new Date(+parts[0], +parts[1] - 1, +parts[2], 12);
                state.view = 'day';
                setRadio('day');
                render();
            });
        });
    }

    // Блоки событий в ячейке конкретного часа
    function blocksHtml(dayEvents, hour) {
        var out = '';
        dayEvents.forEach(function(e) {
            var eh = parseInt(e.time.split(':')[0], 10);
            if (eh === hour) {
                var title = e.time.slice(0, 5) + ' · ' + esc(e.client) + ' — ' + esc(e.service);
                out += '<button type="button" class="cal-event-block ' + statusClass(e.status) + '" data-id="' + e.id + '" title="' + title + '">' +
                       e.time.slice(0, 5) + ' ' + esc(e.client) + ' · ' + esc(e.service) +
                       '</button>';
            }
        });
        return out;
    }

    function setRadio(value) {
        var radios = document.querySelectorAll('input[name="calView"]');
        Array.prototype.forEach.call(radios, function(r) { r.checked = r.value === value; });
    }

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    // ===== Модалка деталей =====
    function openEventModal(eventId) {
        var event = events().find(function(e) { return e.id === eventId; });
        if (!event) return;
        document.getElementById('eventModalTitle').textContent = 'Обращение: ' + event.client;
        document.getElementById('eventModalBody').innerHTML =
            '<div class="event-details">' +
            '<div class="event-summary">' +
                '<strong>' + esc(event.client) + '</strong> — ' + esc(event.phone) + '<br>' +
                'Товар/услуга: ' + esc(event.service) + '<br>' +
                'Статус: <span class="status ' + statusClass(event.status) + '">' + esc(event.status) + '</span><br>' +
                'Дата: ' + event.date + ' ' + event.time + '<br>' +
                'Сумма: ' + (event.spent ? event.spent + ' ₽' : '—') +
            '</div>' +
            '<div class="transcript"><h4>Транскрипция диалога</h4><pre>' + esc(event.transcript) + '</pre></div>' +
            '<div class="ai-analysis"><h4>Анализ ИИ</h4><ul>' +
                '<li><strong>Имя:</strong> ' + esc(event.ai_analysis.name) + '</li>' +
                '<li><strong>Телефон:</strong> ' + esc(event.ai_analysis.phone) + '</li>' +
                '<li><strong>Товар:</strong> ' + esc(event.ai_analysis.service) + '</li>' +
                '<li><strong>Запись:</strong> ' + esc(event.ai_analysis.appointment) + '</li>' +
                '<li><strong>Комментарий:</strong> ' + esc(event.ai_analysis.notes) + '</li>' +
            '</ul></div>' +
            '</div>';
        document.getElementById('eventModal').classList.add('show');
    }

    // Делегирование кликов по блокам событий
    document.addEventListener('click', function(e) {
        var block = e.target.closest('.cal-event-block');
        if (block && block.dataset.id) openEventModal(block.dataset.id);
    });

    function setupModalClose() {
        document.addEventListener('click', function(e) {
            var closeButton = e.target.closest('[data-close-modal]');
            var modal = closeButton ? closeButton.closest('.modal-backdrop') : e.target;
            if (modal && modal.classList.contains('modal-backdrop') &&
                    (closeButton || e.target === modal)) {
                modal.classList.remove('show');
            }
        });
    }

    // ===== Личная CRM: панель клиентов =====
    // Все клиенты за 9 месяцев (из window.events), группировка по имени.
    function buildClients() {
        var map = {};
        events().forEach(function(e) {
            if (!map[e.client]) {
                map[e.client] = { name: e.client, phone: e.phone, count: 0, lastDate: '', lastTime: '', channels: {} };
            }
            var c = map[e.client];
            c.count++;
            c.channels[e.channel] = true;
            var key = e.date + 'T' + e.time;
            if (key > (c.lastDate + 'T' + c.lastTime)) {
                c.lastDate = e.date;
                c.lastTime = e.time;
            }
            if (!c.phone) c.phone = e.phone;
        });
        return Object.keys(map).map(function(k) { return map[k]; });
    }

    function renderClientsPanel() {
        var body = document.getElementById('clientsBody');
        if (!body) return;

        var searchEl = document.getElementById('clientSearch');
        var channelEl = document.getElementById('channelFilter');
        var search = (searchEl && searchEl.value) || '';
        var channel = (channelEl && channelEl.value) || 'all';

        var clients = buildClients();
        var query = search.trim().toLowerCase();

        var filtered = clients.filter(function(c) {
            if (query && (c.name.toLowerCase().indexOf(query) === -1) &&
                (c.phone || '').toLowerCase().indexOf(query) === -1) return false;
            if (channel !== 'all' && !c.channels[channel]) return false;
            return true;
        });

        var totalCountEl = document.getElementById('clientsCount');
        if (totalCountEl) totalCountEl.textContent = filtered.length;

        body.innerHTML = '';
        if (filtered.length === 0) {
            body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8a8f98;padding:24px;">Клиентов не найдено.</td></tr>';
            return;
        }

        filtered.sort(function(a, b) { return b.lastDate.localeCompare(a.lastDate); });

        filtered.forEach(function(c) {
            var mainChannel = c.channels['голос'] ? 'голос' : 'виджет';
            var both = c.channels['голос'] && c.channels['виджет'];
            var badge = '<span class="crm-channel-badge ' + (mainChannel === 'голос' ? 'voice' : 'widget') + '">' +
                        (mainChannel === 'голос' ? '📞 Голос' : '💬 Виджет') + (both ? ' + 💬' : '') + '</span>';
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong>' + esc(c.name) + '</strong></td>' +
                '<td>' + esc(c.phone || '—') + '</td>' +
                '<td>' + c.count + '</td>' +
                '<td>' + c.lastDate.slice(5) + ' ' + c.lastTime + '</td>' +
                '<td>' + badge + '</td>' +
                '<td>›</td>';
            tr.addEventListener('click', function() { openClientModal(c.name); });
            body.appendChild(tr);
        });
    }

    function openClientModal(name) {
        var list = events().filter(function(e) { return e.client === name; })
                           .sort(function(a, b) { return b.date.localeCompare(a.date); });
        if (list.length === 0) return;

        var c = list[0];
        var initials = (c.client || '?').trim().split(/\s+/).map(function(w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
        document.getElementById('clientModalTitle').textContent = 'Клиент: ' + c.client;

        var html =
            '<div class="client-card-head">' +
                '<div class="client-avatar">' + esc(initials) + '</div>' +
                '<div class="client-card-meta">' +
                    '<strong>' + esc(c.client) + '</strong>' +
                    '<span>' + esc(c.phone) + ' · обращений: ' + list.length + ' за 9 месяцев</span>' +
                '</div>' +
            '</div>';

        html += '<h4 style="margin:0 0 10px;color:#1c1c1f;">История обращений и диалоги с ИИ</h4>';
        list.forEach(function(e) {
            var badge = '<span class="crm-channel-badge ' + (e.channel === 'голос' ? 'voice' : 'widget') + '">' +
                        (e.channel === 'голос' ? '📞 Голос' : '💬 Виджет') + '</span>';
            html += '<div class="client-event">' +
                '<div class="client-event-top"><strong>' + esc(e.service) + ' · ' + esc(e.status) + '</strong>' +
                '<span class="client-event-time">' + e.date.slice(5) + ' ' + e.time + ' · ' + badge + '</span></div>' +
                '<pre class="client-event-chat">' + esc(e.transcript) + '</pre>' +
            '</div>';
        });

        document.getElementById('clientModalBody').innerHTML = html;
        document.getElementById('clientModal').classList.add('show');
    }

    function bindClientsPanel() {
        var search = document.getElementById('clientSearch');
        var channel = document.getElementById('channelFilter');
        if (search) search.addEventListener('input', renderClientsPanel);
        if (channel) channel.addEventListener('change', renderClientsPanel);
    }
})();