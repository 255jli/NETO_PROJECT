# PowerShell скрипт для автоматической заморозки Flask-приложения
Write-Host "=== Скрипт автоматической заморозки Flask-приложения ===" -ForegroundColor Green

# Проверяем наличие виртуального окружения
$venvPath = ".venv"
if (-Not (Test-Path $venvPath)) {
    Write-Host "Ошибка: Виртуальное окружение .venv не найдено!" -ForegroundColor Red
    Write-Host "Создайте его с помощью: python -m venv .venv" -ForegroundColor Red
    exit 1
}

Write-Host "Активируем виртуальное окружение..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"

# Проверяем, установлены ли необходимые пакеты
Write-Host "Проверяем наличие необходимых пакетов..." -ForegroundColor Yellow
try {
    & .venv\Scripts\python.exe -c "import flask, flask_frozen; print('Пакеты установлены')"
} catch {
    Write-Host "Устанавливаем Flask и Frozen-Flask в виртуальное окружение..." -ForegroundColor Yellow
    & .venv\Scripts\python.exe -m pip install -r requirements.txt
}

# Запускаем процесс заморозки
Write-Host "Запускаем процесс заморозки приложения..." -ForegroundColor Yellow
& .venv\Scripts\python.exe freeze_app.py

Write-Host "Процесс завершен! Статические файлы находятся в папке 'build/'." -ForegroundColor Green