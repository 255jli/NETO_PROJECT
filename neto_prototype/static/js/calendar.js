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

        document.getElementById('todayBtn').addEventListener('click', function() {
            state.anchor = new Date();
            render();
        });
        document.getElementById('navPrev').addEventListener('click', function() { shift(-1); });
        document.getElementById('navNext').addEventListener('click', function() { shift(1); });

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
        document.querySelectorAll('[data-close-modal]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var modal = btn.closest('.modal-backdrop');
                if (modal) modal.classList.remove('show');
            });
        });
        document.querySelectorAll('.modal-backdrop').forEach(function(modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) modal.classList.remove('show');
            });
        });
    }
})();