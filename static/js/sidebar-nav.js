/**
 * Единая навигация сайдбара NETO.
 * Подключайте после разметки <aside id="sidebar"> и до/после sidebar.js.
 * Перерисовывает nav и логотип одинаково на всех страницах.
 */
(function () {
  var BASE = '/NETO_PROJECT';
  var ITEMS = [
    { id: 'overview', href: BASE + '/dashboard/overview/', icon: 'icon-dashboard', label: 'Обзор' },
    { id: 'widget', href: BASE + '/dashboard/widget/', icon: 'icon-chat-assistant', label: 'Виджет' },
    { id: 'demo', href: BASE + '/dashboard/demo/', icon: 'icon-voice-assistant', label: 'Демо ИИ' },
    { id: 'integration', href: BASE + '/dashboard/integration/', icon: 'icon-link', label: 'Интеграции' },
    { id: 'crm', href: BASE + '/dashboard/crm/', icon: 'icon-users', label: 'CRM' },
    { id: 'parsing', href: BASE + '/dashboard/parsing/', icon: 'icon-search', label: 'Конкуренты' },
    { id: 'calendar', href: BASE + '/dashboard/calendar/', icon: 'icon-shield-check', label: 'Календарь' },
    { id: 'telephony', href: BASE + '/dashboard/telephony/', icon: 'icon-phone-outgoing', label: 'Телефон' },
    { id: 'settings', href: BASE + '/dashboard/settings/', icon: 'icon-settings', label: 'Настройки' },
    { id: 'billing', href: BASE + '/dashboard/billing/', icon: 'icon-billing', label: 'Счёт' }
  ];

  function detectActive() {
    var path = (location.pathname || '').replace(/\/+$/, '') + '/';
    for (var i = 0; i < ITEMS.length; i++) {
      if (path.indexOf('/dashboard/' + ITEMS[i].id + '/') !== -1) return ITEMS[i].id;
    }
    if (path.indexOf('/dashboard/onboarding/') !== -1) return 'overview';
    if (path.indexOf('/dashboard/voice/') !== -1) return 'demo';
    return 'overview';
  }

  function render() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    var active = detectActive();

    // Логотип: чёрный на белом сайдбаре (белый логотип на белом фоне не виден)
    var logo = sidebar.querySelector('a.logo');
    if (!logo) {
      logo = document.createElement('a');
      logo.className = 'logo';
      sidebar.insertBefore(logo, sidebar.firstChild);
    }
    logo.href = BASE + '/dashboard/overview/';
    logo.title = 'NETO';
    logo.innerHTML = '<img src="' + BASE + '/static/img/logo_black_neto.svg" alt="NETO">';

    var nav = sidebar.querySelector('nav.nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'nav';
      sidebar.appendChild(nav);
    }

    var html = '';
    for (var j = 0; j < ITEMS.length; j++) {
      var it = ITEMS[j];
      var cls = 'nav-item' + (it.id === active ? ' active' : '');
      html +=
        '<a href="' +
        it.href +
        '" class="' +
        cls +
        '">' +
        '<i class="' +
        it.icon +
        '"></i>' +
        '<span class="nav-text"><span>' +
        it.label +
        '</span></span>' +
        '</a>';
    }
    nav.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
