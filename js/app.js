import { fetchDistrictRoutes, fetchDistrictName } from './api.js';


let MANUAL_ROUTES_ZONE = window.MANUAL_ROUTES_ZONE || [];
let currentStyle = 'all';
let currentDays = 'all';
let currentBudget = 'all';
let districtSlug = new URLSearchParams(window.location.search).get('slug') || 'canggu';

window.hideRouteOverlay = function() {
    document.getElementById('routeScreen').style.display = 'none';
    document.getElementById('guideContent').style.display = 'block';
    let topBtn = document.querySelector('.back-home-btn');
    if (topBtn) {
        topBtn.innerText = '← Назад к выбору районов';
        topBtn.onclick = function() { window.location.href = 'guides.html?v=' + Date.now(); };
    }
    window.scrollTo(0, 0);
};

window.setDaysFilter = function(days) {
    currentDays = (days === 'all') ? 'all' : parseInt(days);
    window.showRouteGallery();
};

window.filterRoutes = function(style, budget) {
    if (style !== undefined) currentStyle = style;
    if (budget !== undefined) currentBudget = budget;
    window.showRouteGallery();
};

window.showRouteGallery = function() {
  try {
    var routes = window.MANUAL_ROUTES_ZONE || MANUAL_ROUTES_ZONE;
    if (!routes || routes.length === 0) {
        document.getElementById('routesListContainer').innerHTML = '<div style="padding:20px; text-align:center; color:rgba(42,42,40,0.5);">Маршруты для этого района пока в разработке.</div>';
        return; 
    }
    
    var html = '<div style="padding:20px; padding-bottom:100px;">';
    html += '<div style="font-size:22px;font-weight:700;text-align:center;margin-bottom:24px;">🗺 Выбор маршрута</div>';
    
        // Calculate daily average cost for the district
    let totalRouteCosts = 0;
    let totalRouteDays = 0;
    routes.forEach(r => {
        let routeCost = 0;
        if (r.places && Array.isArray(r.places)) {
            r.places.forEach(p => {
                if (p.price && p.price.includes('K')) {
                    let nums = p.price.match(/\d+/g);
                    // Just take the first number (or average of range)
                    if (nums) {
                       let avg = parseInt(nums[0]);
                       if (nums.length > 1) {
                           avg = (parseInt(nums[0]) + parseInt(nums[1])) / 2;
                       }
                       // If it's something like 1.5M, the K match might fail or be weird.
                       // Let's just handle K
                       routeCost += avg;
                    }
                } else if (p.price && (p.price.includes('M') || p.price.includes('м'))) {
                    let nums = p.price.match(/\d+\.?\d*/g);
                    if (nums) routeCost += parseFloat(nums[0]) * 1000;
                } else if (p.price && p.price.includes('$')) {
                    let nums = p.price.match(/\d+/g);
                    if (nums) routeCost += parseInt(nums[0]) * 16;
                }
            });
        }
        totalRouteCosts += routeCost;
        totalRouteDays += (r.days || 1);
    });
    
    let avgCostPerDayIDR = totalRouteDays > 0 ? (totalRouteCosts / totalRouteDays) : 600;
    let avgDollars = Math.round(avgCostPerDayIDR / 16);
    if (avgDollars < 15) avgDollars = 25; // Sane fallback minimums if parsing fails

    // Base Info Block with Budget
    
    // Base Info Block with Budget AND Style Descriptions
    html += '<div style="background:rgba(42,107,90,0.03); border-radius:16px; padding:20px; margin-bottom:24px; border:1px solid rgba(42,107,90,0.1);">';
    html += '  <div style="font-weight:700; color:#2a6b5a; font-size:18px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;"><span>📁 Как выбрать маршрут?</span>';
    html += '  </div>';
    
    
    html += '  <div style="font-size:14px; line-height:1.5; color:rgba(42,42,40,0.8); margin-bottom:16px;">Каждая карточка уже посчитала примерный чек за весь день. Выбирайте фильтры:<br>';
    html += '    <span style="font-weight:600; display:inline-block; margin-top:4px;">💚 Бэкпекер</span><br>';
    html += '    <span style="font-weight:600; display:inline-block; margin-top:4px;">💛 Путешественник</span><br>';
    html += '    <span style="font-weight:600; display:inline-block; margin-top:4px;">❤️ Люкс</span>';
    html += '  </div>';


    html += '  <div style="font-size:14px; font-weight:700; line-height:1.5; color:rgba(42,42,40,0.9); margin-bottom:12px;">Стиль поездки и темп (физиологически просчитанные тайминги):</div>';

    html += '  <div style="margin-bottom:12px;">';
    html += '    <div style="font-weight:700; font-size:15px; color:#e83e8c; margin-bottom:4px;">🌸 Чилл (Восстановление)</div>';
    html += '    <div style="font-size:13px; color:rgba(42,42,40,0.7); line-height:1.4;">Идеален для спасения от джетлага и солнца. Обязательная дневная сиеста на вилле, расслабляющие спа, долгие обеды и никаких переездов по жаре.</div>';
    html += '  </div>';
    
    html += '  <div style="margin-bottom:12px;">';
    html += '    <div style="font-weight:700; font-size:15px; color:#388e3c; margin-bottom:4px;">🟢 Изи (Островной баланс)</div>';
    html += '    <div style="font-size:13px; color:rgba(42,42,40,0.7); line-height:1.4;">Живём как экспаты. Плотный, но комфортный день: творческие мастер-классы, шопинг сувениров, эстетичные закаты и лёгкие вечеринки без гонки на выживание.</div>';
    html += '  </div>';
    
    html += '  <div>';
    html += '    <div style="font-weight:700; font-size:15px; color:#e64a19; margin-bottom:4px;">🔥 Хард (Выжать всё)</div>';
    html += '    <div style="font-size:13px; color:rgba(42,42,40,0.7); line-height:1.4;">Для тех, кому не сидится. Адреналин, грязные квадроциклы, дикие пляжи и шумные клубы. Смена лука перед ужином обязательна.</div>';
    html += '  </div>';

    html += '</div>';


    // Days Filter
    html += '<div style="font-weight:700; color:#2a2a28; margin-bottom:8px; font-size:14px;">Длительность путешествия:</div>';
    html += '<div class="filter-scroll-wrapper" style="display:flex; flex-wrap:nowrap; gap:8px; overflow-x:auto; overflow-y:hidden; padding-bottom:12px; margin-bottom:16px; -webkit-overflow-scrolling: touch; scrollbar-width: none; /* Hide scrollbar for Chrome/Edge */" onwheel="this.scrollLeft += event.deltaY">';
    var dAllBg = (currentDays === 'all') ? '#2a6b5a' : 'rgba(42,107,90,0.1)';
    var dAllCol = (currentDays === 'all') ? 'white' : '#2a6b5a';
    var d1Bg = (currentDays === 1) ? '#2a6b5a' : 'rgba(42,107,90,0.1)';
    var d1Col = (currentDays === 1) ? 'white' : '#2a6b5a';
    var d2Bg = (currentDays === 2) ? '#2a6b5a' : 'rgba(42,107,90,0.1)';
    var d2Col = (currentDays === 2) ? 'white' : '#2a6b5a';
    var d3Bg = (currentDays === 3) ? '#2a6b5a' : 'rgba(42,107,90,0.1)';
    var d3Col = (currentDays === 3) ? 'white' : '#2a6b5a';
    html += '  <button onclick="setDaysFilter(\'all\')" style="padding:8px 16px; border-radius:20px; border:none; background:' + dAllBg + '; color:' + dAllCol + '; white-space:nowrap; font-weight:600;">Все варианты</button>';
    html += '  <button onclick="setDaysFilter(1)" style="padding:8px 16px; border-radius:20px; border:none; background:' + d1Bg + '; color:' + d1Col + '; white-space:nowrap; font-weight:600;">1 день</button>';
    html += '  <button onclick="setDaysFilter(2)" style="padding:8px 16px; border-radius:20px; border:none; background:' + d2Bg + '; color:' + d2Col + '; white-space:nowrap; font-weight:600;">2 дня</button>';
    html += '  <button onclick="setDaysFilter(3)" style="padding:8px 16px; border-radius:20px; border:none; background:' + d3Bg + '; color:' + d3Col + '; white-space:nowrap; font-weight:600;">3 дня</button>';
    html += '</div>';

    // Budget Filter
    html += '<div style="font-weight:700; color:#2a2a28; margin-bottom:8px; font-size:14px;">Бюджет маршрутов:</div>';
    html += '<div class="filter-scroll-wrapper" style="display:flex; flex-wrap:nowrap; gap:8px; overflow-x:auto; overflow-y:hidden; padding-bottom:12px; margin-bottom:16px; -webkit-overflow-scrolling: touch; scrollbar-width: none; /* Hide scrollbar for Chrome/Edge */" onwheel="this.scrollLeft += event.deltaY">';
    html += '  <button id="btn_budget_all" onclick="filterRoutes(undefined, \'all\')" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(42,42,40,0.1); ' + (currentBudget === 'all' ? 'background:#2a2a28; color:white;' : 'background:white; color:#2a2a28;') + ' white-space:nowrap; font-weight:600;">Все бюджеты</button>';
    html += '  <button id="btn_budget_cheap" onclick="filterRoutes(undefined, \'cheap\')" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(42,42,40,0.1); ' + (currentBudget === 'cheap' ? 'background:rgba(76,175,80,0.1); color:#2a6b5a;' : 'background:white; color:#2a2a28;') + ' white-space:nowrap; font-weight:600;">💚 Бэкпекер (до $30 / 450K IDR)</button>';
    html += '  <button id="btn_budget_medium" onclick="filterRoutes(undefined, \'medium\')" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(42,42,40,0.1); ' + (currentBudget === 'medium' ? 'background:rgba(243,156,18,0.1); color:#d35400;' : 'background:white; color:#2a2a28;') + ' white-space:nowrap; font-weight:600;">💛 Комфорт ($30-70 / 450K-1M IDR)</button>';
    html += '  <button id="btn_budget_luxury" onclick="filterRoutes(undefined, \'luxury\')" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(42,42,40,0.1); ' + (currentBudget === 'luxury' ? 'background:rgba(231,76,60,0.1); color:#c0392b;' : 'background:white; color:#2a2a28;') + ' white-space:nowrap; font-weight:600;">❤️ Люкс (от $70 / 1M+ IDR)</button>';
    html += '</div>';

    // Style Filter
    if (currentDays === 'all' || currentDays === 1) {
        html += '<div style="font-weight:700; color:#2a2a28; margin-bottom:8px; font-size:14px;">Стиль поездки:</div>';
        html += '<div class="filter-scroll-wrapper" style="display:flex; flex-wrap:nowrap; gap:8px; overflow-x:auto; overflow-y:hidden; padding-bottom:12px; margin-bottom:16px; -webkit-overflow-scrolling: touch; scrollbar-width: none; /* Hide scrollbar for Chrome/Edge */" onwheel="this.scrollLeft += event.deltaY">';
        html += '  <button id="btn_style_all" onclick="filterRoutes(\'all\', undefined)" style="padding:8px 16px; border-radius:20px; border:1px solid #2a6b5a; ' + (currentStyle === 'all' ? 'background:rgba(42,107,90,0.1); color:#2a6b5a;' : 'background:white; color:#2a2a28;') + ' white-space:nowrap; font-weight:600;">Все темпы</button>';
        html += '  <button id="btn_style_chill" onclick="filterRoutes(\'chill\', undefined)" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(232, 62, 140, 0.3); ' + (currentStyle === 'chill' ? 'background:rgba(255,182,193,0.3); color:#e83e8c;' : 'background:white; color:#e83e8c;') + ' white-space:nowrap; font-weight:600;">🌸 Чилл</button>';
        html += '  <button id="btn_style_easy" onclick="filterRoutes(\'easy\', undefined)" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(76, 175, 80, 0.3); ' + (currentStyle === 'easy' ? 'background:rgba(76,175,80,0.15); color:#388e3c;' : 'background:white; color:#388e3c;') + ' white-space:nowrap; font-weight:600;">🟢 Изи</button>';
        html += '  <button id="btn_style_hard" onclick="filterRoutes(\'hard\', undefined)" style="padding:8px 16px; border-radius:20px; border:1px solid rgba(255, 87, 34, 0.3); ' + (currentStyle === 'hard' ? 'background:rgba(255,87,34,0.15); color:#e64a19;' : 'background:white; color:#e64a19;') + ' white-space:nowrap; font-weight:600;">🔥 Хард</button>';
        html += '</div>';
    }

    let matchedCount = 0;
    
    // Render the cards
    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      
      if (currentStyle !== 'all') {
          // If multi-day is selected, ignore style filter because all multi-day routes are mixed-pace ('easy')
          if (currentDays === 'all' || currentDays === 1) {
              if (route.style !== currentStyle) continue;
          }
      }

      if (currentDays !== 'all') {
          var rd = route.days || 1;
          if (currentDays !== rd) continue;
      }
      
      // Determine route budget dynamically if not explicitly set
      let rb = route.budget || 'medium';
      // In Supabase we don't have route.budget yet, so we assign one randomly or check places prices
      let rcost = 0;
      if (route.places) {
          route.places.forEach(p => {
              if (p.price && p.price.includes('K')) {
                  let nums = p.price.match(/\d+/g);
                  if (nums) rcost += parseInt(nums[0]);
              }
          });
      }
      let rdDays = route.days || 1;
      let rcostPerDay = rcost / rdDays;
      if (rcostPerDay <= 450) rb = 'cheap';
      else if (rcostPerDay >= 1000) rb = 'luxury';
      else rb = 'medium';
      
      if (currentBudget !== 'all' && rb !== currentBudget) continue;
      
      matchedCount++;
      var isChill = (route.style === 'chill');
      var isHard = (route.style === 'hard');
      var isEasy = (route.style === 'easy');
      
      let badge = '';
      if (isChill) {
        badge = '<span style="background:rgba(255,182,193,0.3); color:#e83e8c; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🌸 Чилл</span>';
      } else if (isHard) {
        badge = '<span style="background:rgba(255,87,34,0.15); color:#e64a19; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🔥 Хард</span>';
      } else {
        badge = '<span style="background:rgba(76,175,80,0.15); color:#388e3c; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🟢 Изи</span>';
      }
      
      let budgetBadge = '';
      if (rb === 'cheap') budgetBadge = '<span style="margin-left:6px; background:rgba(76,175,80,0.1); color:#2a6b5a; padding:4px 8px; border-radius:6px; font-weight:600; font-size:12px;">💚 Бюджет</span>';
      else if (rb === 'luxury') budgetBadge = '<span style="margin-left:6px; background:rgba(231,76,60,0.1); color:#c0392b; padding:4px 8px; border-radius:6px; font-weight:600; font-size:12px;">❤️ Люкс</span>';
      else if (rb === 'medium') budgetBadge = '<span style="margin-left:6px; background:rgba(243,156,18,0.1); color:#d35400; padding:4px 8px; border-radius:6px; font-weight:600; font-size:12px;">💛 Средне</span>';

      badge += budgetBadge;
      if(route.days) badge += `<span style="margin-left:6px; background:rgba(42,42,40,0.05); color:rgba(42,42,40,0.7); padding:4px 8px; border-radius:6px; font-weight:600; font-size:12px;">⏱ ${route.days} дн.</span>`;

      var rTitle = route.title || ('Маршрут ' + (i + 1));
      var rPreview = route.preview || '';
      if (!rPreview && route.places) {
          rPreview = route.places.map(p => p.name).join(' → ').substring(0, 77) + '...';
      }

      html += '<div onclick="showSingleRoute(' + i + ')" style="background:#ffffff; border-radius:16px; padding:16px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05); cursor:pointer; transition:transform 0.2s;">';
      html += '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">';
      html += '    <div style="font-size:16px; font-weight:700; color:#2a2a28; max-width:65%; line-height:1.2;">' + rTitle + '</div>';
      html += '    <div style="text-align:right;">' + badge + '</div>';
      html += '  </div>';
      html += '  <div style="font-size:13px; color:rgba(42,42,40,0.7); line-height:1.4; margin-bottom:12px;">' + rPreview + '</div>';
      html += '  <div style="text-align:center; padding-top:12px; border-top:1px solid rgba(42,42,40,0.05); color:#2a6b5a; font-weight:700; font-size:14px;">Посмотреть план →</div>';
      html += '</div>';
    }
    
    if (matchedCount === 0) {
        html += '<div style="text-align:center; padding:20px; color:rgba(42,42,40,0.5);">Для этой комбинации фильтров маршрутов пока нет. Выберите другой фильтр.</div>';
    }
    
    
    html += '</div>';
    
    document.getElementById('routesListContainer').innerHTML = html;
    
    // Highlight buttons after render
    // Highlight logic handled in HTML inline styles
  } catch(e) { 
    console.error(e); 
    document.getElementById('routesListContainer').innerHTML = '<div style="padding:20px; text-align:center; color:red;">Произошла ошибка загрузки галереи.</div>'; 
  }
}

window.showSingleRoute = function(idx) {
  try {
    var routes = window.MANUAL_ROUTES_ZONE || MANUAL_ROUTES_ZONE;
    var routeObj = routes[idx];
    var routeArray = Array.isArray(routeObj) ? routeObj : routeObj.places;
    var rTitle = routeObj.title || ('Маршрут ' + (idx + 1));
    var rPreview = routeObj.preview || '';
    var rStyle = routeObj.style || 'easy';
    
    var isChill = (rStyle === 'chill'); 
    var isHard = (rStyle === 'hard');
    var badge = isChill ? '<span style="background:rgba(255,182,193,0.3); color:#e83e8c; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🌸 Чилл</span>' : (isHard ? '<span style="background:rgba(255,87,34,0.15); color:#e64a19; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🔥 Хард</span>' : '<span style="background:rgba(76,175,80,0.15); color:#388e3c; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">🟢 Изи</span>');
    if(routeObj.days) badge += `<span style="margin-left:6px; background:rgba(42,42,40,0.05); color:rgba(42,42,40,0.7); padding:4px 8px; border-radius:6px; font-weight:600; font-size:12px;">⏱ ${routeObj.days} дн.</span>`;
    
    var html = '<div style="padding:20px; padding-bottom:100px;">';
    html += '<div style="font-size:24px;font-weight:800;text-align:center;margin-bottom:12px;line-height:1.2;color:#2a2a28;">' + rTitle + '</div>';
    if(rPreview) html += '<div style="font-size:14px;color:rgba(42,42,40,0.7);text-align:center;margin-bottom:20px;line-height:1.5">' + rPreview + '</div>';
    html += '<div style="text-align:center;margin-bottom:32px">' + badge + '</div>';

    for (var i = 0; i < routeArray.length; i++) {
      var p = routeArray[i];
      if (p.time && (p.time.includes('❗️') || p.time.includes('📎'))) {
          html += '<div style="background:rgba(232, 62, 140, 0.05); border-left:4px solid #e83e8c; border-radius:12px; padding:20px; margin-bottom:20px;">';
          html += '  <div style="font-size:14px; font-weight:700; color:#e83e8c; margin-bottom:8px; display:flex; align-items:center; gap:6px;">' + p.time + '</div>';
          html += '  <div style="font-size:16px; font-weight:700; color:#2a2a28; margin-bottom:8px;">' + p.name + '</div>';
          let fd = p.desc.replace(/\b(\d+\.)/g, '<br><br>$1').replace(/^<br><br>/, '');
          html += '  <div style="font-size:14px; color:rgba(42,42,40,0.8); line-height:1.6;">' + fd + '</div>';
          html += '</div>';
      } else if (p.time && p.time.includes('🏨')) {
          html += '<div style="background:rgba(42, 107, 90, 0.03); border-left:4px solid #2a6b5a; border-radius:12px; padding:16px; margin-bottom:20px;">';
          html += '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">';
          html += '    <div style="font-size:16px; font-weight:700; color:#2a6b5a;">' + p.name + '</div>';
          html += '    <div style="font-size:12px; font-weight:700; color:#2a6b5a; opacity:0.8;">' + p.time.replace('🏨 ', '') + '</div>';
          html += '  </div>';
          html += '  <div style="font-size:14px; font-weight:600; color:rgba(42,107,90,0.85); line-height:1.5;">' + p.desc + '</div>';
          html += '</div>';
      } else {
          html += '<div style="background:#ffffff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05);position:relative;">';
          html += '  <div style="display:inline-block;background:#2a6b5a;color:white;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:12px;">' + p.time + '</div>';
          html += '  <div style="font-size:18px;font-weight:700;color:#2a2a28;margin-bottom:8px;">' + p.name + '</div>';
          
                    let fd = p.desc || '';
          // Remove double <b> blocks just in case they were already replaced
          fd = fd.replace(/<b><b>/g, '<b>').replace(/<\/b><\/b>/g, '</b>');
          // Remove double BRs after <b> tags that were incorrectly added
          fd = fd.replace(/<b>(.*?)<\/b><br><\/b><br>/g, '<b>$1</b><br>');
          
          // Make all <b> tags pop with solid color
          fd = fd.replace(/<b>/g, '<b style="color:#2a2a28; display:block; margin-top:12px; margin-bottom:4px; font-size:14px;">');
          // Remove existing <br> immediately after <b> tags because we are using display:block
          fd = fd.replace(/(<b style=".*?">.*?<\/b>)\s*(?:<br\s*\/?>)+/g, '$1');
          
          // Clean up excessive BRs
          fd = fd.replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>');
          
          html += '  <div style="font-size:14px;color:rgba(42,42,40,0.7);line-height:1.6;margin-bottom:16px;">' + fd + '</div>';
          if (p.price && p.price !== 'Бесплатно' && p.price !== 'По меню' && p.price !== '') {
            html += '  <div style="font-size:14px;font-weight:600;color:#2a6b5a;margin-bottom:16px;">' + p.price + '</div>';
          }
          if (p.maps && p.maps !== '#' && p.maps !== '') {
            html += '  <div style="margin-top:12px;"><a href="' + p.maps + '" target="_blank" style="color:#e83e8c;text-decoration:none;font-weight:600;font-size:14px;">📍 Открыть в Google Maps</a></div>';
          }
          html += '</div>';
      }
    }
    
    // --- Google Maps Directions button ---
        var mapPlaces = [];
    for (var j = 0; j < routeArray.length; j++) {
      let p = routeArray[j];
      let n = p.name || '';
      let maps = p.maps || '';
      
      let hasMapLink = (maps && maps.length > 5 && maps !== '#');
      // For safety, exclude standard rest blocks if they somehow got a generic map link
      let isRestBlock = (n.includes('Сиеста') || n.includes('Ночев') || n.includes('Дорога'));
      
      if (hasMapLink && !isRestBlock) {
        let cleanName = n.replace(/^.*?:\s*/, '').replace(/\s*\([^)]*\)/g, '').trim();
        if(cleanName) mapPlaces.push(cleanName);
      }
    }
    if (mapPlaces.length >= 2) {
      var origin = encodeURIComponent(mapPlaces[0] + ',' + (typeof forcedDistrict !== 'undefined' ? forcedDistrict : (new URLSearchParams(window.location.search).get('slug') || 'Bali')));
      var destination = encodeURIComponent(mapPlaces[mapPlaces.length - 1] + ',' + (typeof forcedDistrict !== 'undefined' ? forcedDistrict : (new URLSearchParams(window.location.search).get('slug') || 'Bali')));
      var waypoints = '';
      if (mapPlaces.length > 2) {
        var wp = [];
        for (var k = 1; k < mapPlaces.length - 1; k++) {
          wp.push(encodeURIComponent(mapPlaces[k] + ',' + (typeof forcedDistrict !== 'undefined' ? forcedDistrict : (new URLSearchParams(window.location.search).get('slug') || 'Bali'))));
        }
        waypoints = '&waypoints=' + wp.join('%7C');
      }
      var mapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + destination + waypoints + '&travelmode=driving';
      html += '<a href="' + mapsUrl + '" target="_blank" style="display:block;margin:24px 0;padding:16px;background:#2a6b5a;color:white;text-align:center;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 15px rgba(42,107,90,0.3);">🗺️ Открыть весь маршрут в Google Maps</a>';
    }
    
    var btnText = '🔄 Другой ' + (rStyle === 'chill' ? 'CHILL' : (rStyle === 'hard' ? 'HARD' : 'EASY')) + '-маршрут';
    html += '<div style="display:flex;gap:12px;margin-top:32px;">';
    
    html += '  <button class="btn btn-primary" onclick="generateRandomRoute(\'' + rStyle + '\', ' + (routeObj.days || 1) + ')" style="flex:2;padding:16px;border-radius:14px;background:#2a6b5a;color:white;border:none;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 4px 15px rgba(42,107,90,0.3);">' + btnText + '</button>';
    html += '</div>';
    html += '</div>';
    
    document.getElementById('guideContent').style.display = 'none';
    var rs = document.getElementById('routeScreen');
    rs.innerHTML = html;
    rs.style.display = 'block';
    let topBtn = document.getElementById('districtBackBtn') || document.querySelector('.back-home-btn');
    if (topBtn) {
        topBtn.innerText = '← Назад к выбору маршрутов';
        topBtn.onclick = window.hideRouteOverlay;
    }
    window.scrollTo(0, 0);
  } catch(e) { console.error(e); alert('Ошибка: ' + e.message); }
};

window.generateRandomRoute = function(forcedStyle, forcedDays) {
  var available = [];
  for (var i = 0; i < MANUAL_ROUTES_ZONE.length; i++) {
    var route = MANUAL_ROUTES_ZONE[i];
    var routeDays = route.days || 1;
    if (route.style === forcedStyle && routeDays === forcedDays) {
      available.push(i);
    }
  }
  if (available.length > 0) {
    var randomIdx = available[Math.floor(Math.random() * available.length)];
    window.showSingleRoute(randomIdx);
  } else {
    alert('Нет других ' + forcedStyle + ' маршрутов на ' + forcedDays + ' дн.');
  }
};


document.addEventListener('DOMContentLoaded', async function() {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
  
  if (!districtSlug) return;
  
  try {
      const name = await fetchDistrictName(districtSlug);
      document.getElementById('districtTitle').innerText = name;
      
      const routes = await fetchDistrictRoutes(districtSlug);
      MANUAL_ROUTES_ZONE = routes;
      
      window.filterRoutes('all', 'all');
      let ldr = document.getElementById('districtLoader'); if(ldr) ldr.style.display = 'none';
  } catch (e) {
      console.error(e);
      document.getElementById('routesListContainer').innerHTML = '<div style="padding:20px; text-align:center; color:red;">Ошибка загрузки маршрутов с сервера. Попробуйте обновить страницу.</div>';
      let ldr = document.getElementById('districtLoader'); if(ldr) ldr.style.display = 'none';
  }
});
