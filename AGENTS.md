# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Команды
- Запуск: `python neto_prototype/app.py` (Flask dev-сервер, дебаг включён).
- Это демо-фронтенд БЕЗ бэкенда: все данные генерируются в JS, API нет.

## Стек и структура (важно)
- Flask + Jinja-шаблоны + vanilla JS. Единственный Python-файл — `neto_prototype/app.py`.
- Маршруты дашборда динамические: `/dashboard/<path>` рендерит `dashboard/{path}.html`; имена вкладок — словарь `tab_names` в `app.py`. При добавлении страницы обновляй и словарь.
- Стили разнесены по `style_1.css`, `style_2.css`, `style_3.css`, `icons.css` — не один файл. Многие страницы дополнительно держат свои `<style>` и `<script>` прямо в шаблоне.
- Дублирование данных: события генерируются и в `overview.js`, и в `calendar.js` (известное дублирование).

## Критические ограничения (см. `neto_prototype/PROJECT_MANIFEST.md`)
- **Сайдбар НЕПРИКАСАЕМ**: `templates/partials/sidebar.html`, `static/css/sidebar.css`, `static/js/sidebar.js` и стили сайдбара в `style_1.css` — не изменять, не добавлять пункты навигации, не трогать логотип и анимации.
- Адаптивная вёрстка под мобильные НЕ требуется — фокус на десктоп.
- Запрещены inline-стили (кроме крайней необходимости), запрещены анимации scale/translate/box-shadow при наведении.

## Конвенции кода
- Vanilla JS в самовызывающихся функциях `(function(){ 'use strict'; ... })()`, без ES-модулей.
- ES5-стиль (`var`, `.forEach`, `document.getElementById`) — соблюдать, не переписывать на modern синтаксис.
- Сообщения интерфейса и код — на русском языке.
- Используется `showToast(msg, type)` (глобально из `main.js`) для уведомлений.

## Страницы дашборда (актуальный набор)
overview, voice, widget, integration, crm, parsing, calendar, telephony, settings, billing, onboarding.
ВНИМАНИЕ: onboarding — файл есть и используется как точка входа с лендинга, но пункта в сайдбаре нет (так задумано).