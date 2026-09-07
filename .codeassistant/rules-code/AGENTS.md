# Project Coding Rules (Non-Obvious Only)

- Демо-фронтенд: данные генерируются в JS (`overview.js`, `calendar.js`, `widget.js`, `data.js`), API нет. Не искать бэкенд-источники данных.
- Многие страницы дашборда хранят свои `<style>` и `<script>` прямо в шаблоне `dashboard/*.html` — это норма для проекта, а не нарушение.
- Дашборд (overview): виджеты/DnD в `overview.js` + `dashboard-dnd.js` + `sortable.js`, раскладка в `localStorage` как `dashboardLayout`. Графики Chart.js глобально.
- `showToast(msg, type)` глобально из `main.js` — использовать для всех уведомлений.
- Классы виджетов настраиваются модалкой через `widgetConfigs`; при перерисовке графиков чистить `chartInstances`.
- Запрещено трогать сайдбар (sidebar.html/css/js). Новые страницы добавляются в `app.py` словарь `tab_names`.
- ES5-стиль JS (var, .forEach, без стрелочных функций в старых файлах), самовызывающиеся IIFE.