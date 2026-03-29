import re
import subprocess
import os

files = ['index.html', 'guides.html', 'district.html', 'catalog.html']
for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    scripts = re.findall(r'<script>(.*?)</script>', html, flags=re.DOTALL)
    for i, script in enumerate(scripts):
        tmp_name = f'tmp_{filename}_{i}.js'
        with open(tmp_name, 'w', encoding='utf-8') as tmp_f:
            tmp_f.write(script)
        
        result = subprocess.run(['node', '--check', tmp_name], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error in {filename} script {i}: {result.stderr}")
        else:
            print(f"OK: {filename} script {i}")
        os.remove(tmp_name)
