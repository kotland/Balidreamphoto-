import os
import re
import json
import time
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

# Target languages
langs = {
    'en': 'en',
    'ua': 'uk',
    'kz': 'kk',
    'ar': 'ar'
}

base_dir = '/workspace/Balidreamphoto-'
files_to_translate = [
    'index.html', 'guides.html', 'catalog.html', 'district.html', 
    'app_beta.html', 'base.html', 'strategy.html',
    'ubud-guide.html', 'nusadua-guide.html', 'amed-guide.html',
    'lovina-guide.html', 'sanur-guide.html', 'seminyak-guide.html',
    'nusapenida-guide.html', 'uluwatu-guide.html', 'canggu-guide.html'
]

def chunk_translate(text, lang):
    try:
        return GoogleTranslator(source='ru', target=lang).translate(text)
    except Exception as e:
        print(f"Error translating: {e}")
        return text

def translate_html(filepath, output_filepath, lang_code):
    print(f"Translating {filepath} to {lang_code}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Translate text nodes
    for element in soup.find_all(string=True):
        if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
            continue
        text = element.strip()
        if not text or len(text) < 2:
            continue
        if re.search(r'[а-яА-ЯёЁ]', text):
            translated = chunk_translate(text, langs[lang_code])
            if translated:
                element.replace_with(element.replace(text, translated))
                time.sleep(0.1) # small sleep to prevent rate limiting
    
    # Translate some common attributes like placeholders
    for element in soup.find_all(True):
        for attr in ['placeholder', 'title', 'alt']:
            if element.has_attr(attr):
                val = element[attr]
                if re.search(r'[а-яА-ЯёЁ]', val):
                    translated = chunk_translate(val, langs[lang_code])
                    if translated:
                        element[attr] = translated

    # Write output
    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    with open(output_filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Saved {output_filepath}")

for file in files_to_translate:
    in_path = os.path.join(base_dir, file)
    if not os.path.exists(in_path):
        print(f"File {in_path} not found.")
        continue
    for lang in langs.keys():
        out_path = os.path.join(base_dir, lang, file)
        # To avoid massive time limit here, we can process them with a script
        translate_html(in_path, out_path, lang)

print("HTML Translation finished.")
