// sidebar.js — единая навигация + hover collapse + mobile
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

  function renderNav(sidebar) {
    var active = detectActive();

    // Логотип: чёрный SVG на белом сайдбаре (белый логотип был бы невидим)
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
        '</span></span></a>';
    }
    nav.innerHTML = html;
  }

  function initCollapse(sidebar) {
    sidebar.classList.add('no-transition');

    var savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed === 'true') {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
      if (savedCollapsed === null) {
        localStorage.setItem('sidebarCollapsed', 'false');
      }
    }

    requestAnimationFrame(function () {
      sidebar.classList.remove('no-transition');
    });

    sidebar.addEventListener('mouseenter', function () {
      this.classList.remove('collapsed');
      localStorage.setItem('sidebarCollapsed', 'false');
    });

    sidebar.addEventListener('mouseleave', function () {
      this.classList.add('collapsed');
      localStorage.setItem('sidebarCollapsed', 'true');
    });

    var hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        }
      });
    }
  }

  function boot() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    renderNav(sidebar);
    initCollapse(sidebar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
