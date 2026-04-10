import urllib.request
import json
SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c"

req = urllib.request.Request(
    f"{SUPABASE_URL}/districts",
    data=json.dumps([{"slug": "north", "name": "Север (North)"}]).encode("utf-8"),
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
except Exception as e:
    print(e)
