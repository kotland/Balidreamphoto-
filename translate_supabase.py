import os
import json
import time
from deep_translator import GoogleTranslator

langs = {'en': 'en', 'ua': 'uk', 'kz': 'kk', 'ar': 'ar'}
base_dir = '/workspace/Balidreamphoto-'

def translate_text(text, target):
    if not text: return text
    if isinstance(text, str):
        try:
            return GoogleTranslator(source='ru', target=target).translate(text)
        except:
            return text
    return text

def translate_json(filename, text_keys):
    in_path = os.path.join(base_dir, filename + '_ru.json')
    if not os.path.exists(in_path):
        return
    
    with open(in_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for lang, code in langs.items():
        print(f"Translating {filename} to {lang}...")
        translated_data = []
        for item in data:
            new_item = dict(item)
            for k in text_keys:
                if k in new_item and new_item[k]:
                    # Some fields might be JSON objects/arrays themselves (like route_data)
                    if k == 'route_data' and isinstance(new_item[k], list):
                        new_route = []
                        for day in new_item[k]:
                            new_day = dict(day)
                            if 'description' in new_day:
                                new_day['description'] = translate_text(new_day['description'], code)
                            if 'title' in new_day:
                                new_day['title'] = translate_text(new_day['title'], code)
                            new_route.append(new_day)
                        new_item[k] = new_route
                    else:
                        new_item[k] = translate_text(new_item[k], code)
            translated_data.append(new_item)
            
        out_path = os.path.join(base_dir, f"{filename}_{lang}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

translate_json('places_db', ['name', 'description', 'category', 'cuisine'])
translate_json('routes', ['title', 'description', 'route_data'])
print("Supabase JSON translation finished.")
