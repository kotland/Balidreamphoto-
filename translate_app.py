import os
import sys
import json
import time
import glob
from bs4 import BeautifulSoup
import google.generativeai as genai

LANG_MAP = {'en': 'English', 'ua': 'Ukrainian', 'kz': 'Kazakh', 'ar': 'Arabic'}

def process_html():
    files = ['index.html', 'guides.html', 'district.html', 'catalog.html', 'base.html']
    for lang_code, lang_name in LANG_MAP.items():
        os.makedirs(lang_code, exist_ok=True)
        for fname in files:
            if not os.path.exists(fname): continue
            with open(fname, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            if lang_code == 'ar':
                if soup.html: soup.html['dir'] = 'rtl'
                elif soup.body: soup.body['dir'] = 'rtl'
            
            with open(os.path.join(lang_code, fname), 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Translated {fname} to {lang_code}")

def process_json():
    fname = 'data/places_ru.json'
    if not os.path.exists(fname): return
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for lang_code, lang_name in LANG_MAP.items():
        with open(f'data/places_{lang_code}.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Translated {fname} to {lang_code}")

def process_js():
    for lang_code in LANG_MAP.keys():
        os.makedirs(lang_code, exist_ok=True)
        for js_file in glob.glob('js/routes-*.js') + glob.glob('routes-*.js'):
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
            basename = os.path.basename(js_file)
            with open(os.path.join(lang_code, basename), 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Translated {js_file} to {lang_code}")

if __name__ == '__main__':
    process_html()
    process_json()
    process_js()
