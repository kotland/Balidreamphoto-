import re

with open('catalog_good.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure we don't have any broken loaderOverlay or catalogLoader in the original
html = re.sub(r'<div id="catalogLoader".*?</div>', '', html, flags=re.DOTALL)

# Create the loader
loader = """
<div id="catalogLoader" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(248,246,242,0.95);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.5s;">
    <img src="img/star3.png" alt="Loading" style="width:140px;height:140px;margin-bottom:20px;animation:pulse 2s infinite ease-in-out;">
    <h1 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:8px;color:#2a6b5a;text-align:center;">Загружаем каталог мест...</h1>
    <p style="color:rgba(42,42,40,0.5);text-align:center;">Синхронизация с базой</p>
</div>
"""

# Add animation pulse to style
pulse_css = "@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }\n"
if "<style>" in html:
    html = html.replace("<style>", "<style>\n" + pulse_css)
else:
    html = html.replace("</head>", "<style>\n" + pulse_css + "</style>\n</head>")

# Inject the loader after the body tag
html = re.sub(r'(<body[^>]*>)', r'\1\n' + loader, html)

# Ensure the JS correctly fades out the loader
js_loader_fade = """
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
"""

html = re.sub(r'if\s*\(\s*loader\s*\)\s*loader\.style\.display\s*=\s*[\'"]none[\'"];', js_loader_fade, html)

with open('catalog.html', 'w', encoding='utf-8') as f:
    f.write(html)
