// ═══════════════════════════════════════════
//  홈
// ═══════════════════════════════════════════
async function loadHomeData() {
  document.getElementById('home-date').textContent = fmtDate(new Date());
  if(isGuestMode()) {
    const { start, end } = getDR(new Date());
    const meals = getGuestMealsInRange(start, end);
    renderRing(meals);
    renderHomeMeals(meals);
    return;
  }
  if(!sbClient||!currentUser) return;
  try {
    const { start, end } = getDR(new Date());
    const meals = unwrapSupabase(
      await sbClient.from('meal_logs').select('*')
        .eq('user_id',currentUser.id).gte('logged_at',start).lte('logged_at',end).order('logged_at'),
      '오늘 식단을 불러오지 못했어요.'
    ) || [];
    renderRing(meals);
    renderHomeMeals(meals);
  } catch(e) { console.error(e); }
}

function renderRing(meals) {
  const goal = profile.daily_calorie_goal||2000;
  const eaten = meals.reduce((s,m)=>s+(m.calories||0),0);
  const prot = meals.reduce((s,m)=>s+(m.protein||0),0);
  const carb = meals.reduce((s,m)=>s+(m.carbs||0),0);
  const fat = meals.reduce((s,m)=>s+(m.fat||0),0);
  const pct = Math.min(1, eaten/goal);
  document.getElementById('ring-fill').style.strokeDashoffset = 339.3*(1-pct);
  document.getElementById('ring-eaten').textContent = eaten;
  document.getElementById('stat-goal').textContent = goal;
  document.getElementById('stat-remain').textContent = Math.max(0,goal-eaten);
  const setBar = (vi,bi,val,g) => {
    document.getElementById(vi).textContent = `${Math.round(val)}g / ${g}g`;
    const p = Math.min(100, g>0?(val/g)*100:0);
    const bar = document.getElementById(bi);
    bar.style.width = p+'%';
    bar.classList.toggle('over', p>=100);
  };
  setBar('mb-protein-val','mb-protein-bar',prot,profile.protein_goal||150);
  setBar('mb-carb-val','mb-carb-bar',carb,profile.carb_goal||250);
  setBar('mb-fat-val','mb-fat-bar',fat,profile.fat_goal||65);
}

function renderHomeMeals(meals) {
  const wrap = document.getElementById('home-meals-wrap');
  if(!meals.length) { wrap.innerHTML='<div class="empty-state"><div class="empty-icon">🍽️</div><div class="empty-text">오늘 기록된 식사가 없어요</div><div class="empty-sub">아래 + 버튼으로 음식을 분석해보세요</div></div>'; return; }
  const groups = { breakfast:[], lunch:[], dinner:[], snack:[] };
  meals.forEach(m => (groups[m.meal_type]||groups.snack).push(m));
  let html = '';
  Object.entries(groups).forEach(([type,list]) => {
    if(!list.length) return;
    html += `<div class="meal-section-title">${MEAL_LABEL[type]}</div>`;
    list.forEach(m => {
      const thumb = m.image_url
        ? `<img class="meal-thumb" src="${escH(m.image_url)}" alt="food">`
        : `<div class="meal-thumb-icon">${MEAL_ICON[m.meal_type]||'🍴'}</div>`;
      html += `<div class="meal-card">${thumb}<div class="meal-info"><div class="meal-name">${escH(m.food_name)}</div><div class="meal-type-tag">단백질 ${m.protein||0}g · 탄수 ${m.carbs||0}g · 지방 ${m.fat||0}g</div></div><div class="meal-kcal">${m.calories}</div></div>`;
    });
  });
  wrap.innerHTML = html;
}
