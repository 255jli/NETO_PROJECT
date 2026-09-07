// Навигация по секциям (Scroll Snap) - если используется на лендинге
let currentSection = 0;
const sections = document.querySelectorAll('.snap-section');

function scrollToSection(direction) {
    if (sections.length === 0) return;
    currentSection += direction;
    if (currentSection < 0) currentSection = 0;
    if (currentSection >= sections.length) currentSection = sections.length - 1;
    
    sections[currentSection].scrollIntoView({ behavior: 'smooth' });
}

// Голосовой ассистент
const voiceBtn = document.getElementById('voice-demo-btn');
const voiceResult = document.getElementById('voice-result');

if (voiceBtn) {
    voiceBtn.addEventListener('click', function() {
        voiceBtn.disabled = true;
        voiceBtn.textContent = 'Обработка...';
        
        // Имитация API-вызова
        setTimeout(() => {
            voiceResult.innerHTML = `
                <div style="padding: 20px; background: var(--yc-bg); border-radius: var(--radius-md); border: 1px solid var(--yc-border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 0.875rem; color: var(--yc-text-secondary);">Длительность</div>
                            <div style="font-weight: 600;">3 мин 24 сек</div>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: var(--yc-text-secondary);">Интент</div>
                            <div style="font-weight: 600; color: var(--yc-accent);">Запись на пробный урок</div>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: var(--yc-text-secondary);">Настроение</div>
                            <div style="font-weight: 600; color: var(--yc-success);">Позитивное</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;">
                        Отправить в CRM (Обработан)
                    </button>
                </div>
            `;
            voiceBtn.textContent = 'Демонстрация звонка';
            voiceBtn.disabled = false;
        }, 1500);
    });
}

// Функция для получения текущего времени в формате [ЧЧ:ММ:СС]
function getCurrentTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `[${hours}:${minutes}:${seconds}]`;
}

// Сбор данных с пошаговым логом
const parseBtn = document.getElementById('parse-btn');
const parseInput = document.getElementById('parse-input');
const parseResult = document.getElementById('parse-result');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');
const parseLog = document.getElementById('parse-log');
const parseResultsBody = document.getElementById('parse-results-body');
const parseEmptyState = document.getElementById('parse-empty-state');

if (parseBtn) {
    parseBtn.addEventListener('click', function() {
        const url = parseInput.value.trim();
        if (!url) {
            alert('Введите URL конкурента');
            return;
        }
        
        parseBtn.disabled = true;
        parseBtn.textContent = 'Обработка...';
        parseResult.style.display = 'none';
        parseResultsBody.innerHTML = '';
        progressContainer.style.display = 'block';
        parseLog.style.display = 'block';
        parseLog.innerHTML = '';
        parseEmptyState.style.display = 'none';
        
        // Показываем skeleton-эффект во время загрузки
        showSkeletonLoader();
        
        const logs = [
            "Инициализация модуля сбора данных...",
            `Подключение к целевому URL: ${url}...`,
            "Обход Cloudflare / капчи...",
            "Анализ DOM-дерева и поиск прайс-листов...",
            "Извлечение ценовых данных и рейтингов...",
            "Формирование структурированного отчета..."
        ];
        
        let width = 0;
        let logIndex = 0;
        
        // Добавляем первую запись с временной меткой
        const initialTimestamp = getCurrentTimestamp();
        const initialLogEntry = document.createElement('div');
        initialLogEntry.textContent = `${initialTimestamp} ${logs[0]}`;
        parseLog.appendChild(initialLogEntry);
        parseLog.scrollTop = parseLog.scrollHeight;
        progressText.textContent = logs[0];
        
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                
                // Имитация данных после "сбора данных"
                const competitors = [
                    { name: "Школа программирования", service: "Курс Python", price: "12000", rating: "4.8", change: "+2%" },
                    { name: "English Academy", service: "Индивидуальные занятия", price: "1500", rating: "4.6", change: "-1%" },
                    { name: "Math Tutor", service: "Подготовка к ЕГЭ", price: "8000", rating: "4.7", change: "+5%" },
                    { name: "Art Studio", service: "Детские мастер-классы", price: "6000", rating: "4.9", change: "0%" }
                ];
                
                // Заполняем таблицу результатов
                parseResultsBody.innerHTML = ''; // Очищаем skeleton-элементы
                competitors.forEach(comp => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${comp.name}</td>
                        <td>${comp.service}</td>
                        <td class="price-cell">${comp.price} ₽</td>
                        <td>${comp.rating}</td>
                        <td class="change-cell"><span class="${comp.change.startsWith('+') || comp.change === '0%' ? 'trend-up' : 'trend-down'}">${comp.change.startsWith('0') ? '' : comp.change.startsWith('+') ? '▲ ' : '▼ '}${comp.change}</span></td>
                    `;
                    parseResultsBody.appendChild(row);
                });
                
                parseResult.style.display = 'block';
                parseBtn.textContent = 'Собрать данные';
                parseBtn.disabled = false;
                
                // Вызываем функцию подсветки экстремальных цен
                highlightPriceExtremes();
                
                // Скрываем skeleton-эффект
                hideSkeletonLoader();
                
                // Показываем уведомление об успешном завершении
                showToast('Сбор данных завершен успешно!', 'success');
            } else {
                width += 2; // Более плавный прогресс
                progressBar.style.width = width + '%';
                progressPercent.textContent = width + '%';
                
                // Обновляем лог
                const targetLogIndex = Math.floor((width / 100) * logs.length);
                if (targetLogIndex > logIndex && logIndex < logs.length) {
                    logIndex = targetLogIndex;
                    const timestamp = getCurrentTimestamp();
                    const p = document.createElement('div');
                    p.textContent = `${timestamp} ${logs[logIndex - 1]}`;
                    parseLog.appendChild(p);
                    parseLog.scrollTop = parseLog.scrollHeight;
                    progressText.textContent = logs[logIndex - 1];
                }
            }
        }, 100);
    });
}

// Функция для подсветки минимальной и максимальной цены
function highlightPriceExtremes() {
    const priceCells = document.querySelectorAll('.price-cell');
    if (priceCells.length === 0) return;

    const prices = Array.from(priceCells).map(cell => {
        return {
            cell: cell,
            value: parseFloat(cell.textContent.replace(/[^\d]/g, ''))
        };
    });

    // Находим минимальное и максимальное значения
    const minPrice = Math.min(...prices.map(p => p.value));
    const maxPrice = Math.max(...prices.map(p => p.value));

    // Очищаем предыдущие классы
    priceCells.forEach(cell => {
        cell.classList.remove('min-price', 'max-price');
    });

    // Добавляем классы минимальной и максимальной цены
    prices.forEach(priceObj => {
        if (priceObj.value === minPrice) {
            priceObj.cell.classList.add('min-price');
        }
        if (priceObj.value === maxPrice) {
            priceObj.cell.classList.add('max-price');
        }
    });
}

// Функция для сортировки таблицы результатов сбора данных
function initSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

    // Функция для сортировки таблицы
    function sortTable(columnIndex, dataType) {
        const table = document.querySelector('.parse-table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Определяем направление сортировки
        if (currentSortColumn === columnIndex) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = columnIndex;
            currentSortDirection = 'asc';
        }

        // Сортируем строки
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();

            let comparison = 0;
            if (dataType === 'number') {
                // Извлекаем числовое значение из строки (например, "4.8" -> 4.8)
                const aNum = parseFloat(aValue);
                const bNum = parseFloat(bValue);
                comparison = aNum - bNum;
            } else if (dataType === 'price') {
                // Для цен извлекаем числовое значение
                const aPrice = parseFloat(aValue.replace(/[^\d]/g, ''));
                const bPrice = parseFloat(bValue.replace(/[^\d]/g, ''));
                comparison = aPrice - bPrice;
            } else {
                // Для текстовых значений
                comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
            }

            // Учитываем направление сортировки
            return currentSortDirection === 'asc' ? comparison : -comparison;
        });

        // Перестраиваем tbody с отсортированными строками
        rows.forEach(row => tbody.appendChild(row));

        // Обновляем индикаторы сортировки
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '▼';
        });
        
        const currentHeader = sortableHeaders[columnIndex];
        const currentIndicator = currentHeader.querySelector('.sort-indicator');
        currentIndicator.textContent = currentSortDirection === 'asc' ? '▲' : '▼';
    }

    // Добавляем обработчики кликов для заголовков
    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            // Определяем тип данных для сортировки
            let dataType = 'text';
            if (header.dataset.column === 'price') {
                dataType = 'price';
            } else if (header.dataset.column === 'rating') {
                dataType = 'number';
            }

            sortTable(index, dataType);
        });
    });
}

// Анимация чисел в дашборде
function animateValue(element, start, end, duration) {
    const range = end - start;
    let current = start;
    const increment = range / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('ru-RU');
    }, 16);
}

document.addEventListener('DOMContentLoaded', function() {
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(el => {
        const target = parseInt(el.getAttribute('data-target')) || parseInt(el.textContent.replace(/\D/g, ''));
        if (target) {
            animateValue(el, 0, target, 1500);
        }
    });
    
    // Инициализируем сортировку таблицы результатов сбора данных
    initSorting();
});

// Логика переключения вкладок в Dashboard
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const currentPageLabel = document.getElementById('current-page');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Если это реальная ссылка на другой роут Flask, позволяем переход
        // Если это якорь или мы хотим SPA-поведение, раскомментируй e.preventDefault()
        // e.preventDefault(); 
        
        // Убираем активный класс у всех
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));

        // Добавляем активный класс текущему
        this.classList.add('active');
        
        // Определяем ID вкладки из href (например, /dashboard/voice -> tab-voice)
        const path = this.getAttribute('href');
        const tabId = 'tab-' + path.split('/').pop();
        
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
            currentPageLabel.textContent = this.textContent.trim();
        }
    });
});



// Функция для подсветки ключевых слов в расшифровке
function highlightKeywordsInTranscript() {
    const keywords = ['запись', 'цена', 'курс'];
    const messages = document.querySelectorAll('.message-text');
    
    messages.forEach(message => {
        let text = message.innerHTML;
        
        keywords.forEach(keyword => {
            // Используем регулярное выражение для поиска слова без учета регистра
            const regex = new RegExp(`(${keyword})`, 'gi');
            text = text.replace(regex, '<span class="highlight-keyword">$1</span>');
        });
        
        message.innerHTML = text;
    });
}

// Функция для обработки кликов по сообщениям расшифровки
function setupTranscriptClicks() {
    const transcriptMessages = document.querySelectorAll('.transcript-message');
    
    transcriptMessages.forEach(message => {
        message.addEventListener('click', function() {
            // Получаем время сообщения
            const messageTime = this.getAttribute('data-time');
            console.log('Клик по сообщению в расшифровке с временем:', messageTime);
            
            // Здесь должна быть логика перемотки аудио к нужному моменту
            // Для демонстрации просто установим прогресс на 50%
            const timelineProgress = document.getElementById('timeline-progress');
            if (timelineProgress) {
                timelineProgress.style.width = '50%';
            }
            
            // Обновляем текущее время
            const currentTimeElement = document.getElementById('current-time');
            if (currentTimeElement) {
                currentTimeElement.textContent = '1:00'; // Условное время для демонстрации
            }
        });
    });
}

// Функция для копирования расшифровки
function setupCopyTranscript() {
    const copyTranscriptBtn = document.getElementById('copy-transcript-btn');
    
    if (copyTranscriptBtn) {
        copyTranscriptBtn.addEventListener('click', function() {
            // Собираем весь текст расшифровки
            const transcriptMessages = document.querySelectorAll('.transcript-message');
            let transcriptText = '';
            
            transcriptMessages.forEach(message => {
                const sender = message.querySelector('.message-sender').textContent;
                const text = message.querySelector('.message-text').textContent;
                const time = message.getAttribute('data-time');
                transcriptText += `[${time}] ${sender}: ${text}\n`;
            });
            
            // Копируем текст в буфер обмена
            navigator.clipboard.writeText(transcriptText).then(function() {
                // Показываем уведомление
                const originalText = copyTranscriptBtn.innerHTML;
                copyTranscriptBtn.innerHTML = '✓ Скопировано';
                
                setTimeout(function() {
                    copyTranscriptBtn.innerHTML = originalText;
                }, 2000);
            }).catch(function(err) {
                console.error('Ошибка при копировании расшифровки: ', err);
                alert('Не удалось скопировать расшифровку');
            });
        });
    }
}

// Добавление функционала для аудиоплеера на странице детального просмотра звонка
document.addEventListener('DOMContentLoaded', function() {
    // Ищем элементы аудиоплеера на странице детального просмотра звонка
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseText = document.getElementById('play-pause-text');
    const timelineProgress = document.getElementById('timeline-progress');
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    const volumeSlider = document.getElementById('volume-slider');
    const visualizerBars = document.querySelectorAll('.visualizer-bar');
    const downloadBtn = document.getElementById('download-btn');
    
    if(playPauseBtn) {
        let isPlaying = false;
        let currentProgress = 0;
        let progressInterval;
        
        // Обновляем время в формате MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Функция для обновления прогресса
        function updateProgress() {
            if(isPlaying) {
                currentProgress += 0.5;
                if(currentProgress > 100) currentProgress = 0;
                timelineProgress.style.width = currentProgress + '%';
                
                // Обновляем текущее время
                const totalDuration = totalTimeElement.textContent;
                // Разбираем длительность в формате MM:SS
                const timeParts = totalDuration.split(':');
                const totalMinutes = parseInt(timeParts[0]);
                const totalSeconds = parseInt(timeParts[1]);
                const totalSecs = totalMinutes * 60 + totalSeconds;
                
                const currentSeconds = Math.floor((currentProgress / 100) * totalSecs);
                currentTimeElement.textContent = formatTime(currentSeconds);
            }
        }
        
        // Обработка кнопки воспроизведения/паузы
        playPauseBtn.addEventListener('click', function() {
            isPlaying = !isPlaying;
            
            if(isPlaying) {
                playPauseText.textContent = 'Пауза';
                // Запускаем анимацию визуализатора
                animateVisualizer();
                // Запускаем таймер прогресса
                progressInterval = setInterval(updateProgress, 500);
            } else {
                playPauseText.textContent = 'Воспроизвести';
                // Останавливаем анимацию визуализатора
                stopVisualizerAnimation();
                // Останавливаем таймер прогресса
                clearInterval(progressInterval);
            }
        });
        
        // Обработка изменения громкости
        if(volumeSlider) {
            volumeSlider.addEventListener('input', function() {
                // Здесь будет логика изменения громкости
                console.log('Громкость изменена:', volumeSlider.value);
            });
        }
        
        // Анимация визуализатора звука
        function animateVisualizer() {
            visualizerBars.forEach(bar => {
                // Устанавливаем случайную высоту для анимации
                const randomHeight = Math.floor(Math.random() * 30) + 5;
                bar.style.height = randomHeight + 'px';
            });
            
            if(isPlaying) {
                setTimeout(animateVisualizer, 200); // Обновляем каждые 200мс
            }
        }
        
        // Остановка анимации визуализатора
        function stopVisualizerAnimation() {
            visualizerBars.forEach(bar => {
                bar.style.height = '5px'; // Минимальная высота
            });
        }
        
        // Имитация клика по кнопке скачивания
        if(downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                showToast('Функция скачивания аудиозаписи будет реализована в следующей версии', 'error');
            });
        }
    }
    
    // Вызываем функции для подсветки ключевых слов, кликов по расшифровке и копирования
    highlightKeywordsInTranscript();
    setupTranscriptClicks();
    setupCopyTranscript();
});

// Логика для переключателей интеграций
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    
    toggleSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const statusText = this.closest('.card').querySelector('.integration-status span:last-child');
            const statusIndicator = this.closest('.card').querySelector('.status-indicator');
            
            if (this.checked) {
                statusText.textContent = 'Подключено';
                statusIndicator.style.backgroundColor = '#2E7D32'; // Зеленый
            } else {
                statusText.textContent = 'Отключено';
                statusIndicator.style.backgroundColor = '#94A3B8'; // Серый
            }
        });
    });
});

// Логика для модального окна настройки интеграций
document.addEventListener('DOMContentLoaded', function() {
    const configureButtons = document.querySelectorAll('.configure-btn');
    const modal = document.getElementById('integration-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const integrationForm = document.getElementById('integration-form');
    
    // Открытие модального окна
    configureButtons.forEach(button => {
        button.addEventListener('click', function() {
            const integrationType = this.getAttribute('data-integration');
            document.querySelector('.modal-header h3').textContent = `Настройка интеграции: ${integrationType.toUpperCase()}`;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Предотвращаем прокрутку фона
        });
    });
    
    // Закрытие модального окна
    function closeIntegrationModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Возвращаем прокрутку
    }
    
    closeModal.addEventListener('click', closeIntegrationModal);
    cancelBtn.addEventListener('click', closeIntegrationModal);
    
    // Закрытие модального окна при клике на backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeIntegrationModal();
        }
    });
    
    // Обработка сохранения формы
    saveBtn.addEventListener('click', function() {
        const apiKey = document.getElementById('api-key').value;
        const apiUrl = document.getElementById('api-url').value;
        
        if (!apiKey || !apiUrl) {
            alert('Пожалуйста, заполните обязательные поля');
            return;
        }
        
        // Здесь будет логика сохранения настроек интеграции
        console.log('Сохранение настроек интеграции:', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            testRequest: document.getElementById('test-request').value
        });
        
        closeIntegrationModal();
        showToast('Настройки интеграции успешно сохранены!', 'success');
    });
});


// static/js/main.js (добавить в конец)

// Глобальная функция для показа toast-уведомлений
function showToast(message, type = 'success') {
    var container = document.getElementById('toast-container');
    if (!container) {
        // Если контейнера нет, создаём
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: 360px;';
        document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.style.cssText = `
        padding: 12px 20px;
        background: ${type === 'success' ? '#2E7D32' : '#D32F2F'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        animation: slideUp 0.3s ease forwards;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.textContent = message;

    // Добавляем иконку
    var icon = document.createElement('span');
    icon.textContent = type === 'success' ? '✅' : '⚠️';
    toast.prepend(icon);

    container.appendChild(toast);

    // Удаляем через 3 секунды
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

// Добавляем стили анимации для toast
var styleToast = document.createElement('style');
styleToast.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleToast);