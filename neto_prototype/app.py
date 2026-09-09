from flask import Flask, render_template, jsonify
from flask import abort

app = Flask(__name__)

TAB_NAMES = {
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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@app.route('/dashboard/<path:path>')
def dashboard(path='overview'):
    if path not in TAB_NAMES:
        abort(404)

    active_tab_name = TAB_NAMES[path]
    # «Телефон» и «Голос» объединены в одну страницу (voice.html) —
    # обе ссылки сайдбара ведут на единый раздел «Голос и номер».
    template = 'voice' if path == 'telephony' else path
    return render_template(f'dashboard/{template}.html', active_tab=path, active_tab_name=active_tab_name)

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