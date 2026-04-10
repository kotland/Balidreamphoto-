import os
import re
from deep_translator import GoogleTranslator

langs = {'en': 'en', 'ua': 'uk', 'kz': 'kk', 'ar': 'ar'}
base_dir = '/workspace/Balidreamphoto-'
js_file = os.path.join(base_dir, 'places.js')

def translate_js():
    if not os.path.exists(js_file):
        print(f"{js_file} not found.")
        return

    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find fields to translate
    # Things like: district:'Убуд'
    fields_to_translate = ['district', 'category', 'desc', 'signatureDish', 'cuisine']

    for lang, code in langs.items():
        print(f"Translating places.js to {lang}...")
        
        # We will parse out string values and translate them
        # Note: A real implementation for production would parse JS properly, 
        # but a simple regex replacement works for this structured data.
        
        translated_content = content
        
        # Extract unique Russian words/phrases to translate to avoid redundant API calls
        phrases = set()
        for field in fields_to_translate:
            pattern = fr"{field}:'(.*?)'"
            matches = re.findall(pattern, content)
            for m in matches:
                if re.search(r'[а-яА-ЯёЁ]', m):
                    phrases.add(m)
        
        # Translate phrases
        trans_map = {}
        for p in phrases:
            try:
                trans = GoogleTranslator(source='ru', target=code).translate(p)
                if trans:
                    trans_map[p] = trans.replace("'", "\\'")
            except Exception as e:
                print(e)
                trans_map[p] = p
                
        # Replace in content
        for field in fields_to_translate:
            def replacer(match):
                orig = match.group(1)
                if orig in trans_map:
                    return f"{field}:'{trans_map[orig]}'"
                return match.group(0)
            
            pattern = fr"{field}:'(.*?)'"
            translated_content = re.sub(pattern, replacer, translated_content)
        
        out_file = os.path.join(base_dir, f'places_{lang}.js')
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(translated_content)
        print(f"Saved {out_file}")

translate_js()
