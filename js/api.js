const SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c";

export async function fetchDistrictRoutes(slug) {
    const res = await fetch(`${SUPABASE_URL}/routes?district_slug=eq.${slug}`, {
        headers: {
            "apikey": SUPABASE_ANON,
            "Authorization": `Bearer ${SUPABASE_ANON}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch routes");
    return await res.json();
}

export async function fetchDistrictName(slug) {
    const res = await fetch(`${SUPABASE_URL}/districts?slug=eq.${slug}&select=name`, {
        headers: {
            "apikey": SUPABASE_ANON,
            "Authorization": `Bearer ${SUPABASE_ANON}`
        }
    });
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data.length > 0 ? data[0].name : 'Unknown';
}
