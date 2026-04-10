import os
import re
import json
import time
from deep_translator import GoogleTranslator

langs = {'en': 'en', 'ua': 'uk', 'kz': 'kk', 'ar': 'ar'}
base_dir = '/workspace/Balidreamphoto-'
js_file = os.path.join(base_dir, 'places.js')

def translate_places():
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # extract the array
    match = re.search(r'var PLACES\s*=\s*(\[.*\]);?', content, re.DOTALL)
    if not match:
        print("Could not parse places.js")
        return
    
    # Very hacky parsing for dirty JS object array (it's not valid JSON)
    # Actually, generating localized JSON files is better.
    # We will write a small node script to evaluate places.js and write out JSONs, then Python can translate those JSONs!

node_script = """
const fs = require('fs');
eval(fs.readFileSync('places.js', 'utf8'));
fs.writeFileSync('places.json', JSON.stringify(PLACES, null, 2));
"""
with open(os.path.join(base_dir, 'export_places.js'), 'w') as f:
    f.write(node_script)
