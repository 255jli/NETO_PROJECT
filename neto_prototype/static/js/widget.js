// static/js/widget.js
(function() {
    // 1. Получаем параметры из URL
    var script = document.currentScript;
    var src = script ? script.src : '';
    var params = new URLSearchParams(src.split('?')[1] || '');
    var color = params.get('color') || '005FF9';
    var size = parseInt(params.get('size')) || 72;
    var iconKey = params.get('icon') || 'chat';

    // 2. Если есть глобальная конфигурация, используем её (приоритет выше)
    if (window.NETO_WIDGET_CONFIG) {
        var cfg = window.NETO_WIDGET_CONFIG;
        if (cfg.color) color = cfg.color;
        if (cfg.size) size = parseInt(cfg.size);
        if (cfg.icon) iconKey = cfg.icon;
    }

    // 3. SVG иконки
    var icons = {
        'chat': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        'message': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H8l-4 4V6c0-1.1.9-2 2-2z"/></svg>',
        'support': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        'help': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        'headset': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><path d="M18 19c0 1.1-.9 2-2 2h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3z"/><path d="M6 19c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3z"/></svg>'
    };
    var iconSvg = icons[iconKey] || icons['chat'];

    // 4. Проверяем, не существует ли уже контейнера, чтобы не дублировать
    if (document.getElementById('neto-widget-container')) {
        return; // Уже есть виджет на странице
    }

    // 5. Создаём контейнер
    var container = document.createElement('div');
    container.id = 'neto-widget-container';
    document.body.appendChild(container);

    // 6. Стили
    // ID позволяет удалять старые стили при повторной загрузке (страница настройки виджета)
    var style = document.createElement('style');
    style.id = 'neto-widget-style';
    style.textContent = `
        #neto-widget-container * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        #neto-widget-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background-color: #${color};
            color: white;
            border: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
            z-index: 9999;
            font-size: 24px;
        }
        #neto-widget-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 28px rgba(0,0,0,0.25);
        }
        #neto-widget-btn svg {
            width: 50%;
            height: 50%;
            stroke: white;
            fill: none;
        }
        #neto-widget-panel {
            position: fixed;
            bottom: calc(${size}px + 24px + 12px);
            right: 24px;
            width: 340px;
            max-height: 460px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 9998;
            border: 1px solid #EDEEF0;
        }
        #neto-widget-panel.open { display: flex; }
        #neto-widget-header {
            background: #${color};
            color: white;
            padding: 14px 18px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
        }
        #neto-widget-close {
            background: none;
            border: none;
            color: white;
            font-size: 22px;
            cursor: pointer;
            opacity: 0.8;
            padding: 0 4px;
        }
        #neto-widget-close:hover {
            opacity: 1;
        }
        #neto-widget-messages {
            padding: 14px;
            flex: 1;
            overflow-y: auto;
            max-height: 280px;
            background: #F8FAFC;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .neto-msg {
            padding: 10px 14px;
            border-radius: 16px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }
        .neto-msg.user {
            background: #${color};
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .neto-msg.bot {
            background: white;
            color: #1C1C1F;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }
        #neto-widget-input-area {
            display: flex;
            border-top: 1px solid #EDEEF0;
            padding: 10px 14px;
            background: white;
            gap: 8px;
        }
        #neto-widget-input {
            flex: 1;
            border: 1px solid #DADCE0;
            border-radius: 20px;
            padding: 8px 16px;
            outline: none;
            font-size: 14px;
            color: #1C1C1F;
            background: #F8FAFC;
        }
        #neto-widget-input:focus {
            border-color: #${color};
            background: white;
        }
        #neto-widget-send {
            background: #${color};
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 18px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
        }
        #neto-widget-send:hover {
            background: #${color}dd;
        }
        @media (max-width: 480px) {
            #neto-widget-panel {
                width: calc(100% - 32px);
                right: 16px;
                bottom: calc(${size}px + 16px + 12px);
                max-height: 400px;
            }
        }
    `;
    var prevStyle = document.getElementById('neto-widget-style');
    if (prevStyle) prevStyle.remove();
    document.head.appendChild(style);

    // 7. HTML структура
    container.innerHTML = `
        <button id="neto-widget-btn">${iconSvg}</button>
        <div id="neto-widget-panel">
            <div id="neto-widget-header">
                <span>NETO Ассистент</span>
                <button id="neto-widget-close">✕</button>
            </div>
            <div id="neto-widget-messages"></div>
            <div id="neto-widget-input-area">
                <input id="neto-widget-input" placeholder="Напишите сообщение..." />
                <button id="neto-widget-send">➤</button>
            </div>
        </div>
    `;

    // 8. Логика чата
    var btn = document.getElementById('neto-widget-btn');
    var panel = document.getElementById('neto-widget-panel');
    var closeBtn = document.getElementById('neto-widget-close');
    var input = document.getElementById('neto-widget-input');
    var sendBtn = document.getElementById('neto-widget-send');
    var messages = document.getElementById('neto-widget-messages');

    // История в localStorage (с привязкой к цвету, чтобы сбросить при изменении)
    var storageKey = 'neto_chat_history';
    var history = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (history.length === 0) {
        history.push({ text: 'Здравствуйте! Чем могу помочь?', from: 'bot' });
    }

    function renderMessages() {
        messages.innerHTML = history.map(function(msg) {
            var cls = 'neto-msg ' + msg.from;
            return '<div class="' + cls + '">' + escapeHtml(msg.text) + '</div>';
        }).join('');
        messages.scrollTop = messages.scrollHeight;
    }
    renderMessages();

    function addMessage(text, from) {
        history.push({ text: text, from: from });
        localStorage.setItem(storageKey, JSON.stringify(history));
        renderMessages();
    }

    function sendMessage() {
        var text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        // Имитация ответа бота
        setTimeout(function() {
            addMessage('Спасибо за ваш запрос! Наш ассистент обрабатывает его. В ближайшее время с вами свяжется менеджер.', 'bot');
        }, 600);
    }

    btn.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) input.focus();
    });
    closeBtn.addEventListener('click', function() { panel.classList.remove('open'); });
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 9. Сохраняем конфигурацию для последующих вызовов
    window.NETO_WIDGET_CONFIG = { color, size, icon: iconKey };
})();