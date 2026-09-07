// static/js/data.js
// Демо-данные для небольшого сайта по перепродаже шкафов.
// Владелец — обычный человек, не разработчик; выделяет на сервис ~1500 ₽/мес.
// Обращений немного (~2–4 в неделю), чеки скромные. Цель — реалистично НИЗКИЕ цифры.
// До подключения бэкенда/API данные генерируются здесь, на фронте.
(function() {
    // Форматирует объект Date в 'YYYY-MM-DD'
    function formatDate(date) {
        return date.toISOString().slice(0, 10);
    }
    // Дата за offset дней назад от сегодня
    function daysAgo(offset) {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() - offset);
        return formatDate(d);
    }

    // Товары (перепродажа мебели) и типичные чеки
    const catalog = [
        { service: 'Шкаф-купе', spent: 12000 },
        { service: 'Комод', spent: 4500 },
        { service: 'Тумба под ТВ', spent: 3000 },
        { service: 'Стеллаж', spent: 2500 },
        { service: 'Сборка мебели', spent: 1500 },
        { service: 'Доставка', spent: 800 }
    ];

    // Шаблон события: id, date, time, client, phone, service, status, spent, transcript, ai_analysis
    const rows = [
        { d: 44, t: '10:15', c: 'Ольга', p: '+7 (910) 223-45-11', s: 'Шкаф-купе',     st: 'записан',     sp: 12000 },
        { d: 42, t: '14:40', c: 'Николай', p: '+7 (911) 344-52-20', s: 'Комод',          st: 'не записан',  sp: 0 },
        { d: 40, t: '09:05', c: 'Марина', p: '+7 (912) 155-73-31', s: 'Тумба под ТВ',   st: 'отказ',       sp: 0 },
        { d: 38, t: '16:20', c: 'Сергей', p: '+7 (913) 266-84-42', s: 'Доставка',       st: 'записан',     sp: 800 },
        { d: 36, t: '11:50', c: 'Анна', p: '+7 (914) 377-95-53', s: 'Стеллаж',        st: 'не записан',  sp: 0 },
        { d: 33, t: '13:10', c: 'Пётр', p: '+7 (915) 488-06-64', s: 'Сборка мебели',  st: 'записан',     sp: 1500 },
        { d: 31, t: '17:35', c: 'Елена', p: '+7 (916) 599-17-75', s: 'Комод',          st: 'записан',     sp: 4500 },
        { d: 29, t: '10:45', c: 'Владимир', p: '+7 (917) 610-28-86', s: 'Шкаф-купе',   st: 'не записан',  sp: 0 },
        { d: 27, t: '12:30', c: 'Татьяна', p: '+7 (918) 721-39-97', s: 'Тумба под ТВ', st: 'отказ',       sp: 0 },
        { d: 25, t: '15:55', c: 'Игорь', p: '+7 (919) 832-40-08', s: 'Доставка',      st: 'записан',     sp: 800 },
        { d: 22, t: '09:40', c: 'Наталья', p: '+7 (920) 943-51-19', s: 'Стеллаж',      st: 'записан',     sp: 2500 },
        { d: 20, t: '14:15', c: 'Артём', p: '+7 (921) 054-62-20', s: 'Комод',          st: 'не записан',  sp: 0 },
        { d: 18, t: '11:20', c: 'Светлана', p: '+7 (922) 165-73-31', s: 'Шкаф-купе',   st: 'записан',     sp: 12000 },
        { d: 16, t: '16:05', c: 'Виктор', p: '+7 (923) 276-84-42', s: 'Сборка мебели', st: 'отказ',       sp: 0 },
        { d: 13, t: '10:50', c: 'Людмила', p: '+7 (924) 387-95-53', s: 'Тумба под ТВ', st: 'записан',     sp: 3000 },
        { d: 11, t: '13:25', c: 'Дмитрий', p: '+7 (925) 498-06-64', s: 'Доставка',     st: 'записан',     sp: 800 },
        { d: 9, t: '09:55', c: 'Ирина', p: '+7 (926) 509-17-75', s: 'Стеллаж',        st: 'не записан',  sp: 0 },
        { d: 7, t: '15:30', c: 'Роман', p: '+7 (927) 610-28-86', s: 'Комод',          st: 'записан',     sp: 4500 },
        { d: 5, t: '12:10', c: 'Галина', p: '+7 (928) 721-39-97', s: 'Шкаф-купе',     st: 'не записан',  sp: 0 },
        { d: 3, t: '17:00', c: 'Максим', p: '+7 (929) 832-40-08', s: 'Сборка мебели', st: 'записан',     sp: 1500 },
        { d: 1, t: '10:30', c: 'Вера', p: '+7 (930) 943-51-19', s: 'Тумба под ТВ',    st: 'записан',     sp: 3000 }
    ];

    const events = rows.map(function(r, i) {
        const item = catalog.filter(function(x) { return x.service === r.s; })[0] || { service: r.s, spent: 0 };
        const spent = r.st === 'записан' ? r.sp : 0;
        return {
            id: 'evt-' + (i + 1),
            date: daysAgo(r.d),
            time: r.t,
            client: r.c,
            phone: r.p,
            service: item.service,
            status: r.st,
            spent: spent,
            transcript:
                'Клиент: «Здравствуйте, ' + r.s.toLowerCase() +
                ', есть в наличии?»\nАссистент: «Да, подскажу цену и удобное время. Записать вас на доставку/сборку?»\nКлиент: «Да, давайте.»',
            ai_analysis: {
                name: r.c,
                phone: r.p,
                service: item.service,
                appointment: r.st === 'записан' ? 'Запись оформлена' : 'Запись не оформлена',
                notes: r.st === 'отказ' ? 'Клиент отложил решение' : (r.st === 'записан' ? 'Готов к покупке' : 'Уточнял цену')
            }
        };
    });

    window.events = events;

    window.filterEventsByPeriod = function(events, period) {
        const now = new Date();
        let startDate = new Date();
        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return events;
        }
        const startStr = formatDate(startDate);
        return events.filter(e => e.date >= startStr);
    };

    window.currentPeriod = 'month';
    window.filteredEvents = window.filterEventsByPeriod(window.events, window.currentPeriod);
})();