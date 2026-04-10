import json

with open("/workspace/Balidreamphoto-/data/multiday_routes.json", "r", encoding="utf-8") as f:
    routes = json.load(f)

for r in routes:
    r["title"] = r.pop("name")
    r["preview"] = r.pop("desc")
    # keep priority just in case, or maybe remove it if it fails?
    # Let's try removing it first, or keeping it and see.
    if "priority" in r:
        del r["priority"]

with open("/workspace/Balidreamphoto-/data/multiday_routes.json", "w", encoding="utf-8") as f:
    json.dump(routes, f, ensure_ascii=False, indent=2)

import urllib.request
SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c"

req = urllib.request.Request(
    f"{SUPABASE_URL}/routes",
    data=json.dumps(routes).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON,
        "Authorization": f"Bearer {SUPABASE_ANON}",
        "Prefer": "return=minimal"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Supabase status: {response.status}")
        print("Successfully injected into Supabase!")
except urllib.error.HTTPError as e:
    print(f"Supabase HTTP Error: {e.code} {e.read().decode('utf-8')}")

