#!/usr/bin/env python
"""
Script to freeze the Flask application using Frozen-Flask.
Run this script to generate static files from your Flask application.
"""

import os
import sys
from neto_prototype.app import app, freezer as app_freezer
from flask_frozen import Freezer
from pathlib import Path

class CustomFreezer(Freezer):
    def __init__(self, app):
        super().__init__(app)
        
    def _build_one(self, url, last_modified=None):
        try:
            return super()._build_one(url, last_modified)
        except ValueError as e:
            # If we get a 404 for a static file, we can skip it or create a placeholder
            if "NOT FOUND" in str(e):
                # Log the missing file but continue
                print(f"Warning: Skipping missing resource at {url}")
                
                # For static files, we could potentially create an empty file
                if url.startswith('/static/'):
                    # Create the destination path for the static file
                    # self.root is the build destination, so we append the URL path
                    rel_path = url[1:]  # Remove leading slash
                    dest_path = os.path.join(self.root, rel_path)  # self.root already contains the build path
                    
                    # Ensure the directory exists
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    
                    # Check if the path ends with a slash, indicating a directory
                    if url.endswith('/'):
                        # Just ensure the directory exists, no file to create
                        os.makedirs(dest_path, exist_ok=True)
                    else:
                        # Create an empty file
                        with open(dest_path, 'w') as f:
                            f.write("")
                        
                    # Return as Path object
                    return Path(dest_path)
                else:
                    # For non-static files, raise the error
                    raise e
            else:
                # Re-raise the exception if it's not a 404
                raise e

def freeze_app():
    """
    Function to freeze the Flask application
    """
    print("Starting to freeze the Flask application...")
    print("This will generate static files in the build/ folder")
    
    import shutil

    # Initialize custom freezer
    freezer = CustomFreezer(app)

    # Переносим генераторы URL, зарегистрированные в app.py.
    # Без этого CustomFreezer не знает о под-путях дашборда (страницы не собираются).
    for gen in app_freezer.url_generators:
        freezer.register_generator(gen)

    # Set configuration
    app.config['FREEZER_DESTINATION'] = os.path.join(os.getcwd(), 'build')
    app.config['FREEZER_BASE_URL'] = ''
    # Относительные ссылки вместо абсолютных /static/... — критично для GitHub Pages,
    # где сайт лежит в подкаталоге репозитория (иначе абсолютные пути ломаются).
    app.config['FREEZER_RELATIVE_URLS'] = True
    app.config['FREEZER_REMOVE_EXTRA_FILES'] = True
    app.config['FREEZER_IGNORE_MIMETYPE_WARNINGS'] = True

    # Очищаем предыдущую сборку, чтобы избежать конфликтов
    # "файл vs каталог" (например, build/dashboard) между запусками.
    dest = app.config['FREEZER_DESTINATION']
    if os.path.isdir(dest):
        shutil.rmtree(dest)

    # Freeze the application
    freezer.freeze()
    
    print("\nApplication successfully frozen!")
    print(f"Static files are located in: {app.config['FREEZER_DESTINATION']}")
    print("\nTo serve the static site locally, you can use Python's built-in HTTP server:")
    print("cd build")
    print("python -m http.server 8000")
    print("\nThen open http://localhost:8000 in your browser.")

if __name__ == '__main__':
    freeze_app()