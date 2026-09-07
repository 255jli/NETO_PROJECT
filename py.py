import os
import re
import sys

def minify_html_normal(html):
    """Mode 1: Replace sequences of 2+ whitespaces with a single space and strip."""
    # Replace multiple consecutive spaces/tabs/newlines with a single space
    html = re.sub(r'\s{2,}', ' ', html)
    # Strip leading and trailing whitespace
    html = html.strip()
    return html

def minify_html_hard(html):
    """Mode 2: Like normal, then remove quoted strings, then remove '/' and '\'."""
    html = minify_html_normal(html)
    # Remove quoted strings (content within single or double quotes)
    # This regex handles simple cases without considering escaped quotes inside.
    html = re.sub(r'(["\']).*?\1', '', html, flags=re.DOTALL)
    # Remove all '/' and '\'
    html = html.replace('/', '')
    html = html.replace('\\', '')
    return html

def minify_html_hardcore(html):
    """Mode 3: Like hard, then remove all HTML tags <...>."""
    html = minify_html_hard(html)
    # Remove all HTML tags
    html = re.sub(r'<[^>]*>', '', html)
    # It's good practice to strip again after major changes
    html = html.strip()
    return html

def minify_html(input_file, output_file, mode='normal'):
    """
    Minifies an HTML file using the specified mode (1, 2, or 3).
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        html = f.read()

    if mode == 'normal':
        processed_html = minify_html_normal(html)
    elif mode == 'hard':
        processed_html = minify_html_hard(html)
    elif mode == 'hardcore':
        processed_html = minify_html_hardcore(html)
    else:
        raise ValueError(f"Unknown mode: {mode}. Supported modes: 'normal', 'hard', 'hardcore'.")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(processed_html)

if __name__ == '__main__':
    print("HTML Minifier")
    print("-------------")
    print("Modes:")
    print("1. Normal - Replace multiple spaces with one, strip ends.")
    print("2. Hard - Like normal, remove quoted strings, remove '/', '\\'.")
    print("3. Hardcore - Like hard, remove all HTML tags <...>.")
    
    # Get mode from user
    while True:
        try:
            mode_choice = int(input("Select mode (1-3): "))
            if mode_choice == 1:
                mode = 'normal'
                break
            elif mode_choice == 2:
                mode = 'hard'
                break
            elif mode_choice == 3:
                mode = 'hardcore'
                break
            else:
                print("Please enter a number between 1 and 3.")
        except ValueError:
            print("Invalid input. Please enter a number (1, 2, or 3).")

    # Get filenames from user
    input_filename = input(f"Enter input filename (default: metrica.html): ").strip()
    if not input_filename:
        input_filename = 'metrica.html'
        
    output_filename = input(f"Enter output filename (default: metrica.min.{mode[:3]}.html): ").strip()
    if not output_filename:
        output_filename = f'metrica.min.{mode[:3]}.html'

    input_path = os.path.join('.', input_filename)
    output_path = os.path.join('.', output_filename)
    
    print(f"\nMinifying '{input_path}' -> '{output_path}' using mode '{mode}'...")
    minify_html(input_path, output_path, mode)
    print("Done.")