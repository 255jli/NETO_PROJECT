// sidebar.js — управление сайдбаром (наведение, сохранение состояния, мобильное меню)
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger-btn');

    if (!sidebar) return;

    // --- 1. Временно отключаем анимацию ---
    sidebar.classList.add('no-transition');

    // --- 2. Восстанавливаем состояние из localStorage ---
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed === 'true') {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
        if (savedCollapsed === null) {
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    }

    // --- 3. Включаем анимацию обратно ---
    requestAnimationFrame(() => {
        sidebar.classList.remove('no-transition');
    });

    // --- 4. Наведение мыши – разворачиваем/сворачиваем ---
    sidebar.addEventListener('mouseenter', function() {
        this.classList.remove('collapsed');
        localStorage.setItem('sidebarCollapsed', 'false');
    });

    sidebar.addEventListener('mouseleave', function() {
        this.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
    });

    // --- 5. Мобильное меню (гамбургер) ---
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
});