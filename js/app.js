import { fetchDistrictRoutes, fetchDistrictName } from './api.js';

let MANUAL_ROUTES_ZONE = [];
let currentStyle = 'all';
let currentDays = 'all';
let districtSlug = new URLSearchParams(window.location.search).get('slug') || 'canggu';

window.hideRouteOverlay = function() {
    document.getElementById('routeScreen').style.display = 'none';
    document.getElementById('guideContent').style.display = 'block';
    window.scrollTo(0, 0);
};

window.setDaysFilter = function(days) {
    currentDays = days;
    window.showRouteGallery();
};

window.filterRoutes = function(style) {
    currentStyle = style;
    
    // Reset buttons
    ['all','chill','easy','hard'].forEach(s => {
        let b = document.getElementById('btn_style_' + s);
        if(b) {
            b.style.background = 'white';
            if(s==='all') { b.style.color = '#2a6b5a'; b.style.border = '1px solid #2a6b5a'; }
            else if(s==='chill') { b.style.color = '#e83e8c'; b.style.border = '1px solid rgba(232, 62, 140, 0.3)'; }
            else if(s==='easy') { b.style.color = '#388e3c'; b.style.border = '1px solid rgba(76, 175, 80, 0.3)'; }
            else if(s==='hard') { b.style.color = '#e64a19'; b.style.border = '1px solid rgba(255, 87, 34, 0.3)'; }
        }
    });

    let activeStyleBtn = document.getElementById('btn_style_' + style);
    if (activeStyleBtn) {
        if(style==='all') { activeStyleBtn.style.background = '#2a6b5a'; activeStyleBtn.style.color = 'white'; activeStyleBtn.style.border = 'none'; }
        else if(style==='chill') { activeStyleBtn.style.background = 'rgba(255,182,193,0.3)'; activeStyleBtn.style.color = '#e83e8c'; activeStyleBtn.style.border = 'none'; }
        else if(style==='easy') { activeStyleBtn.style.background = 'rgba(76,175,80,0.15)'; activeStyleBtn.style.color = '#388e3c'; activeStyleBtn.style.border = 'none'; }
        else if(style==='hard') { activeStyleBtn.style.background = 'rgba(255,87,34,0.15)'; activeStyleBtn.style.color = '#e64a19'; activeStyleBtn.style.border = 'none'; }
    }
    
    window.showRouteGallery();
};

window.showRouteGallery = function() {
    try {
        const routesListContainer = document.getElementById('routesListContainer');
        if (!MANUAL_ROUTES_ZONE || MANUAL_ROUTES_ZONE.length === 0) {
            routesListContainer.innerHTML = '<div style="padding:20px; text-align:center; color:rgba(42,42,40,0.5);">Маршруты для этого района пока в разработке.</div>';
            return; 
        }
        
        let html = '<div style="padding:20px; padding-bottom:100px;">';
        html += '<div style="font-size:22px;font-weight:700;text-align:center;margin-bottom:24px;">🗺 Выбор маршрута</div>';
        
        // Info Box
        html += '<div style="background:rgba(42,107,90,0.03); border-radius:16px; padding:20px; margin-bottom:24px; border:1px solid rgba(42,107,90,0.1);">';
        html += '  <div style="font-weight:700; color:#2a6b5a; font-size:18px; margin-bottom:12px; display:flex; align-items:center; gap:8px;"><span>📁</span> Как выбрать свой день?</div>';
        html += '  <div style="font-size:14px; line-height:1.5; color:rgba(42,42,40,0.8); margin-bottom:16px;">Этот гайд — ваш личный консьерж. Мы физиологически просчитали идеальные тайминги, учли жару, пробки и ваше выгорание.</div>';
        html += '</div>';

        // Filters: Pace
        html += '<div style="font-weight:700; color:#2a2a28; margin-bottom:8px; font-size:14px;">Стиль поездки:</div>';
        html += '<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px; scrollbar-width:none;">';
        html += `  <button id="btn_style_all" onclick="filterRoutes('all')" style="padding:8px 16px; border-radius:20px; border:${currentStyle==='all'?'none':'1px solid #2a6b5a'}; background:${currentStyle==='all'?'#2a6b5a':'white'}; color:${currentStyle==='all'?'white':'#2a6b5a'}; white-space:nowrap; font-weight:600;">Все</button>`;
        html += `  <button id="btn_style_chill" onclick="filterRoutes('chill')" style="padding:8px 16px; border-radius:20px; border:${currentStyle==='chill'?'none':'1px solid rgba(232, 62, 140, 0.3)'}; background:${currentStyle==='chill'?'rgba(255,182,193,0.3)':'white'}; color:#e83e8c; white-space:nowrap; font-weight:600;">🌸 Чилл</button>`;
        html += `  <button id="btn_style_easy" onclick="filterRoutes('easy')" style="padding:8px 16px; border-radius:20px; border:${currentStyle==='easy'?'none':'1px solid rgba(76, 175, 80, 0.3)'}; background:${currentStyle==='easy'?'rgba(76,175,80,0.15)':'white'}; color:#388e3c; white-space:nowrap; font-weight:600;">🟢 Изи</button>`;
        html += `  <button id="btn_style_hard" onclick="filterRoutes('hard')" style="padding:8px 16px; border-radius:20px; border:${currentStyle==='hard'?'none':'1px solid rgba(255, 87, 34, 0.3)'}; background:${currentStyle==='hard'?'rgba(255,87,34,0.15)':'white'}; color:#e64a19; white-space:nowrap; font-weight:600;">🔥 Хард</button>`;
        html += '</div>';

        // Filters: Days
        html += '<div style="font-weight:700; color:#2a2a28; margin-bottom:8px; font-size:14px;">Длительность:</div>';
        html += '<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; margin-bottom:25px; scrollbar-width:none;">';
        [ 'all', 1, 2, 3 ].forEach(d => {
            let isActive = (currentDays === d || currentDays === String(d));
            let bg = isActive ? '#2a6b5a' : 'rgba(42,107,90,0.1)';
            let col = isActive ? 'white' : '#2a6b5a';
            let label = d === 'all' ? 'Все' : `${d} дн.`;
            let arg = typeof d === 'number' ? d : `'${d}'`;
            html += `  <button onclick="setDaysFilter(${arg})" style="padding:8px 16px; border-radius:20px; border:none; background:${bg}; color:${col}; white-space:nowrap; font-weight:600;">${label}</button>`;
        });
        html += '</div>';

        // Render Cards
        let count = 0;
        MANUAL_ROUTES_ZONE.forEach((r, idx) => {
            let rDays = r.days || 1;
            let rStyle = r.style || 'easy';

            if(currentStyle !== 'all' && rStyle !== currentStyle) return;
            if(currentDays !== 'all' && String(rDays) !== String(currentDays)) return;

            count++;
            let isChill = (rStyle === 'chill'); 
            let isHard = (rStyle === 'hard');
            let badgeStyle = isChill 
                ? '<span style="background:rgba(255,182,193,0.3); color:#e83e8c; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🌸 Чилл</span>' 
                : (isHard ? '<span style="background:rgba(255,87,34,0.15); color:#e64a19; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🔥 Хард</span>' : '<span style="background:rgba(76,175,80,0.15); color:#388e3c; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🟢 Изи</span>');

            html += `<div style="background:white; border-radius:16px; padding:16px; margin-bottom:16px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.03);" onclick="showSingleRoute(${idx})">`;
            html += `  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">`;
            html += `    <div style="font-weight:800; font-size:18px; color:#2a2a28; line-height:1.2; padding-right:10px;">${r.title}</div>`;
            html += `  </div>`;
            html += `  <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">`;
            html += `    ${badgeStyle}`;
            html += `    <span style="background:rgba(42,42,40,0.05); color:#2a2a28; padding:2px 6px; border-radius:4px; font-weight:600; font-size:11px;">⏱ ${rDays} дн.</span>`;
            html += `  </div>`;
            html += `  <div style="font-size:13px; color:rgba(42,42,40,0.7); line-height:1.4; margin-bottom:16px;">${r.preview}</div>`;
            html += `  <button style="width:100%; background:rgba(42,107,90,0.06); color:#2a6b5a; border:none; padding:10px; border-radius:10px; font-weight:700; font-size:14px;">Посмотреть план →</button>`;
            html += `</div>`;
        });

        if(count === 0) {
            html += `<div style="text-align:center; padding:30px 20px; color:rgba(42,42,40,0.5);">Для выбранных фильтров пока нет маршрутов.<br>Попробуйте изменить параметры.</div>`;
        }
        html += '</div>';

        routesListContainer.innerHTML = html;
    } catch(e) { 
        console.error(e); 
    }
};

window.showSingleRoute = function(idx) {
    try {
        let routeObj = MANUAL_ROUTES_ZONE[idx];
        let rStyle = routeObj.style || 'easy';
        let rDays = routeObj.days || 1;
        
        let isChill = (rStyle === 'chill'); 
        let isHard = (rStyle === 'hard');
        let badge = isChill 
            ? '<span style="background:rgba(255,182,193,0.3); color:#e83e8c; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🌸 Чилл</span>' 
            : (isHard ? '<span style="background:rgba(255,87,34,0.15); color:#e64a19; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🔥 Хард</span>' : '<span style="background:rgba(76,175,80,0.15); color:#388e3c; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px;">🟢 Изи</span>');

        let html = '<div style="padding:20px;">';
        html += `<button onclick="hideRouteOverlay()" style="background:none; border:none; color:#2a6b5a; font-weight:600; font-size:16px; padding:0; margin-bottom:20px; display:flex; align-items:center;">← Назад</button>`;
        
        html += `<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">`;
        html += `  ${badge}`;
        html += `  <span style="background:rgba(42,42,40,0.05); color:#2a2a28; padding:2px 6px; border-radius:4px; font-weight:600; font-size:11px;">⏱ ${rDays} дн.</span>`;
        html += `</div>`;
        
        html += `<div style="font-weight:800; font-size:24px; color:#2a2a28; line-height:1.2; margin-bottom:12px;">${routeObj.title}</div>`;
        html += `<div style="font-size:15px; color:rgba(42,42,40,0.8); line-height:1.5; margin-bottom:24px;">${routeObj.preview}</div>`;
        
        // Places list
        let places = Array.isArray(routeObj) ? routeObj : (routeObj.places || []);
        places.forEach((p, pIdx) => {
            let isConcierge = p.time && (p.time.includes('Консьерж') || p.time.includes('📎'));
            let isSiesta = p.name && (p.name.includes('Сиеста') || p.name.includes('🏨'));
            let blockBg = isConcierge ? 'rgba(232,62,140,0.05)' : (isSiesta ? 'rgba(42,107,90,0.05)' : 'white');
            let blockBorder = isConcierge ? '1px solid rgba(232,62,140,0.1)' : (isSiesta ? '1px solid rgba(42,107,90,0.1)' : '1px solid rgba(0,0,0,0.05)');
            
            html += `<div style="background:${blockBg}; border-radius:16px; padding:16px; margin-bottom:16px; border:${blockBorder}; position:relative; box-shadow:0 2px 10px rgba(0,0,0,0.02);">`;
            html += `  <div style="font-weight:800; color:${isConcierge ? '#e83e8c' : '#2a6b5a'}; font-size:13px; margin-bottom:8px;">${p.time || ''}</div>`;
            html += `  <div style="font-weight:800; font-size:18px; color:#2a2a28; margin-bottom:8px;">${p.name || ''}</div>`;
            html += `  <div style="font-size:14px; color:rgba(42,42,40,0.8); line-height:1.5; margin-bottom:12px;">${p.desc || ''}</div>`;
            
            let metaHtml = [];
            if(p.price) metaHtml.push(`💰 ${p.price}`);
            if(p.maps) metaHtml.push(`📍 <a href="${p.maps}" target="_blank" style="color:#2a6b5a;text-decoration:none;font-weight:600;">Google Maps</a>`);
            
            if(metaHtml.length > 0) {
                html += `<div style="display:flex; gap:16px; font-size:13px; color:rgba(42,42,40,0.6); margin-top:12px; padding-top:12px; border-top:1px dashed rgba(0,0,0,0.1);">`;
                html += metaHtml.join('<span>·</span>');
                html += `</div>`;
            }
            html += `</div>`;
        });
        
        let btnText = '🔄 Другой ' + (rStyle === 'chill' ? 'CHILL' : (rStyle === 'hard' ? 'HARD' : 'EASY')) + '-маршрут';
        html += `<div style="display:flex;gap:12px;margin-top:24px;">`;
        html += `  <button onclick="hideRouteOverlay()" style="flex:1;padding:14px;border-radius:14px;background:rgba(42,42,40,0.1);color:#2a2a28;border:none;font-weight:600;">← Назад</button>`;
        html += `  <button onclick="generateRandomRoute('${rStyle}', ${rDays})" style="flex:2;padding:14px;border-radius:14px;background:#2a6b5a;color:white;border:none;font-weight:600;font-size:14px;">${btnText}</button>`;
        html += `</div>`;

        html += '</div>';
        
        document.getElementById('guideContent').style.display = 'none';
        let rs = document.getElementById('routeScreen');
        rs.innerHTML = html;
        rs.style.display = 'block';
        window.scrollTo(0, 0);
    } catch(e) { 
        console.error(e); 
    }
};

window.generateRandomRoute = function(forcedStyle, forcedDays) {
    let available = [];
    for (let i = 0; i < MANUAL_ROUTES_ZONE.length; i++) {
        let route = MANUAL_ROUTES_ZONE[i];
        let rDays = route.days || 1;
        if (route.style === forcedStyle && rDays === forcedDays) {
            available.push(i);
        }
    }
    if (available.length > 0) {
        let randomIdx = available[Math.floor(Math.random() * available.length)];
        window.showSingleRoute(randomIdx);
    } else {
        alert('Нет других ' + forcedStyle + ' маршрутов на ' + forcedDays + ' дн.');
    }
};

async function init() {
    try {
        const districtName = await fetchDistrictName(districtSlug);
        document.getElementById('districtTitle').innerText = districtName;
        
        MANUAL_ROUTES_ZONE = await fetchDistrictRoutes(districtSlug);
        window.showRouteGallery();
    } catch(err) {
        console.error("Init err:", err);
        document.getElementById('routesListContainer').innerHTML = '<div style="padding:20px; color:red;">Ошибка загрузки маршрутов.</div>';
    }
}

document.addEventListener('DOMContentLoaded', init);
