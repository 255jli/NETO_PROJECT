from flask import Flask, render_template, jsonify, send_from_directory
from flask import abort
import os

try:
    from flask_frozen import Freezer
except ImportError:
    # If Frozen-Flask is not installed, define a dummy Freezer class
    class Freezer:
        def __init__(self, app): pass
        def register_generator(self, func): return func
        def freeze(self): print("Freezer not installed. Run 'pip install Frozen-Flask'")

app = Flask(__name__)
freezer = Freezer(app)

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

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

# Serve static files normally during development
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Обработчик 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Generator for freezer to know all the paths for dashboard
@freezer.register_generator
def dashboard():
    # Yield the base dashboard route
    yield {}
    # Yield all the specific dashboard routes with path parameter
    for tab in TAB_NAMES.keys():
        yield {'path': tab}

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'freeze':
        freezer.freeze()
    else:
        app.run(debug=True)

