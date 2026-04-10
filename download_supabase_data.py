import urllib.request
import json

SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c"

req = urllib.request.Request(f"{SUPABASE_URL}/routes?select=*", headers={
    "apikey": SUPABASE_ANON,
    "Authorization": f"Bearer {SUPABASE_ANON}"
})
with urllib.request.urlopen(req) as response:
    routes = json.loads(response.read().decode())
    with open('/workspace/Balidreamphoto-/routes_ru.json', 'w') as f:
        json.dump(routes, f, ensure_ascii=False, indent=2)

req = urllib.request.Request(f"{SUPABASE_URL}/places?select=*", headers={
    "apikey": SUPABASE_ANON,
    "Authorization": f"Bearer {SUPABASE_ANON}"
})
with urllib.request.urlopen(req) as response:
    places = json.loads(response.read().decode())
    with open('/workspace/Balidreamphoto-/places_db_ru.json', 'w') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

print("Downloaded routes and places from Supabase to JSON.")
