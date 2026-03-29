from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.tags = []
        self.errors = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.tags.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
        if not self.tags:
            self.errors.append(f"Unexpected closing tag </{tag}> at {self.getpos()}")
            return
        last_tag, pos = self.tags.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{last_tag}> but got </{tag}> at {self.getpos()}")

    def close(self):
        super().close()
        for tag, pos in self.tags:
            self.errors.append(f"Unclosed tag <{tag}> started at {pos}")

for filename in ['index.html', 'guides.html', 'district.html', 'catalog.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        parser = MyHTMLParser(filename)
        parser.feed(f.read())
        parser.close()
        if parser.errors:
            print(f"Errors in {filename}:")
            for e in parser.errors:
                print("  " + e)
        else:
            print(f"{filename} HTML is well-formed.")
