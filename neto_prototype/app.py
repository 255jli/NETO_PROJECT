from flask import Flask, render_template, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@app.route('/dashboard/<path:path>')
def dashboard(path='overview'):
    tab_names = {
        'onboarding': 'Первые шаги',
        'overview': 'Обзор',
        'voice': 'Голосовой ассистент',
        'widget': 'Виджет',
        'integration': 'Интеграции',
        'crm': 'CRM',
        'parsing': 'Конкуренты',
        'calendar': 'Календарь',
        'telephony': 'Настройка номера',
        'settings': 'Безопасность и номера',
        'billing': 'Счёт'
    }
    active_tab_name = tab_names.get(path, 'Обзор')
    return render_template(f'dashboard/{path}.html', active_tab=path, active_tab_name=active_tab_name)

@app.route('/about')
def about():
    return render_template('about.html')

# Обработчик 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)


# Townscaper web