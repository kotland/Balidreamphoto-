
function startLiving(){ checkRouteAccess('guides.html?v=' + Date.now()); }
function openBase(){ window.location.href = 'base.html?v=' + Date.now(); }
function openCatalog(){ checkRouteAccess('catalog.html?v=' + Date.now()); }

function setLang(lang) {
  localStorage.setItem('bali_lang', lang);
  document.getElementById('langOverlay').style.display = 'none';
  if (lang === 'en') { window.location.href = 'en/index.html?v=' + Date.now(); return; }
  if (lang === 'ua') { window.location.href = 'ua/index.html?v=' + Date.now(); return; }
  if (lang === 'kz') { window.location.href = 'kz/index.html?v=' + Date.now(); return; }
  if (lang === 'ar') { window.location.href = 'ar/index.html?v=' + Date.now(); return; }
}

function showLangOverlay() {
  if (localStorage.getItem('bali_lang')) {
    var lang = localStorage.getItem('bali_lang');
    if (lang === 'en') { window.location.href = 'en/index.html?v=' + Date.now(); return; }
    if (lang === 'ua') { window.location.href = 'ua/index.html?v=' + Date.now(); return; }
    if (lang === 'kz') { window.location.href = 'kz/index.html?v=' + Date.now(); return; }
    if (lang === 'ar') { window.location.href = 'ar/index.html?v=' + Date.now(); return; }
    return;
  }
  document.getElementById('langOverlay').style.display = 'flex';
}

const SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c";

let hasVerifiedAccess = false;

async function checkRouteAccess(targetUrl) {
    if (hasVerifiedAccess) {
        window.location.href = targetUrl;
        return;
    }

    const authOverlay = document.getElementById('authOverlay');
    const authDenied = document.getElementById('authDenied');
    
    // Make overlay active but completely transparent
    authOverlay.style.background = 'transparent';
    authOverlay.style.backdropFilter = 'none';
    authOverlay.style.display = 'flex';
    authDenied.style.display = 'none';

    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initDataUnsafe || !window.Telegram.WebApp.initDataUnsafe.user) {
        authOverlay.style.background = 'rgba(248,246,242,0.9)';
        authOverlay.style.backdropFilter = 'blur(5px)';
        authDenied.innerHTML = '<div style="font-size:48px;margin-bottom:20px;">📱</div><h1 style="font-family:\'Playfair Display\',serif;font-size:24px;margin-bottom:8px;color:#e74c3c;">Откройте в Telegram</h1><p style="color:rgba(42,42,40,0.7);margin-bottom:20px;">Платные разделы доступны только внутри бота.</p><div style="text-align:center;"><button onclick="document.getElementById(\'authOverlay\').style.display=\'none\'" style="padding:14px 40px;border-radius:14px;font-size:16px;background:rgba(42,42,40,0.1);color:#2a2a28;border:none;font-weight:600;">Закрыть</button></div>';
        authDenied.style.display = 'block';
        return;
    }

    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const userId = user.id;
    const username = user.username ? user.username.toLowerCase() : '';

    try {
        let query = `?select=has_access&or=(id.eq.${userId},username.eq.${username})&has_access=eq.true`;
        let response = await fetch(`${SUPABASE_URL}/users${query}`, {
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`
            }
        });
        let data = await response.json();
        
        if (data && data.length > 0 && data[0].has_access) {
            hasVerifiedAccess = true;
            authOverlay.style.display = 'none';
            window.location.href = targetUrl;
        } else {
            authOverlay.style.background = 'rgba(248,246,242,0.9)';
            authOverlay.style.backdropFilter = 'blur(5px)';
            authDenied.style.display = 'block';
        }
    } catch(e) {
        authOverlay.style.background = 'rgba(248,246,242,0.9)';
        authOverlay.style.backdropFilter = 'blur(5px)';
        authDenied.innerHTML = '<p>Ошибка соединения с БД</p><button onclick="document.getElementById(\'authOverlay\').style.display=\'none\'" style="margin-top:10px;padding:10px 20px;background:rgba(0,0,0,0.1);border-radius:10px;border:none;">Закрыть</button>';
        authDenied.style.display = 'block';
    }
}

var CHOICE_PHRASES=['Выбери, что нужно именно тебе','С чего начнём?','Что ищешь на Бали?'];
var cSub=document.getElementById('choiceSubtitle');
if(cSub){cSub.textContent=CHOICE_PHRASES[Math.floor(Math.random()*CHOICE_PHRASES.length)];}

if(window.Telegram && Telegram.WebApp){
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

if (!localStorage.getItem('bali_lang')) {
    document.getElementById('langOverlay').style.display = 'flex';
} else {
    var lg = localStorage.getItem('bali_lang');
    if (lg === 'en') { window.location.href = 'en/index.html?v=' + Date.now(); }
    if (lg === 'ua') { window.location.href = 'ua/index.html?v=' + Date.now(); }
    if (lg === 'kz') { window.location.href = 'kz/index.html?v=' + Date.now(); }
    if (lg === 'ar') { window.location.href = 'ar/index.html?v=' + Date.now(); }
}
