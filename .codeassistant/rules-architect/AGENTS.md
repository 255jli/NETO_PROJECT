# Project Architecture Rules (Non-Obvious Only)

- Единственный Python-файл `neto_prototype/app.py`; маршруты дашборда динамические `/dashboard/<path>` → `dashboard/{path}.html`; словарь `tab_names` должен покрывать все страницы.
- Архитектура — микросервисная только в презентации; в прототипе чистый демо-фронтенд (Flask + Jinja + vanilla JS), бэкенд не строится до валидации UX (принцип из PROJECT_TEMPLATE.md).
- Сайдбар — «священная корова» (проектный architectural constraint): никаких правок HTML/CSS/JS сайдбара и пунктов навигации.
- Каждый модуль = отдельная вкладка (`voice` голос, `widget` чат, `parsing` конкуренты, `integration` знания/CRM, `crm`, `telephony` номера/тарифы, `settings` безопасность/номера).
- Фокус только на десктоп; адаптив под мобильные не требуется.
- Данные о клиентах/событиях генерируются на фронте (дублирование между overview.js и calendar.js известно).