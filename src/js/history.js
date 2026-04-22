// ═══════════════════════════════════════════
//  히스토리
// ═══════════════════════════════════════════
function changeHistoryDate(d) { historyDate.setDate(historyDate.getDate()+d); loadHistoryData(); }

async function loadHistoryData() {
  document.getElementById('history-date-text').textContent = fmtDate(historyDate);
  if(isGuestMode()) {
    const { start, end } = getDR(historyDate);
    renderHistory(getGuestMealsInRange(start, end));
    return;
  }
  if(!sbClient||!currentUser) return;
  try {
    const {start,end} = getDR(historyDate);
    const meals = unwrapSupabase(
      await sbClient.from('meal_logs').select('*')
        .eq('user_id',currentUser.id).gte('logged_at',start).lte('logged_at',end).order('logged_at'),
      '기록을 불러오지 못했어요.'
    ) || [];
    renderHistory(meals);
  } catch(e){ console.error(e); }
}

function renderHistory(meals) {
  const wrap = document.getElementById('history-list-wrap');
  if(!meals.length) { wrap.innerHTML='<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">이 날 식사 기록이 없어요</div></div>'; return; }
  const groups={breakfast:[],lunch:[],dinner:[],snack:[]};
  meals.forEach(m=>(groups[m.meal_type]||groups.snack).push(m));
  let html='';
  Object.entries(groups).forEach(([type,list])=>{
    if(!list.length) return;
    html+=`<div class="meal-section-title">${MEAL_LABEL[type]}</div>`;
    list.forEach(m=>{
      const thumb = m.image_url
        ? `<img class="meal-thumb" src="${escH(m.image_url)}" alt="food">`
        : `<div class="meal-thumb-icon">${MEAL_ICON[m.meal_type]||'🍴'}</div>`;
      html+=`<div class="history-meal-card">
        ${thumb}
        <div class="meal-info"><div class="meal-name">${escH(m.food_name)}</div>
        <div class="meal-type-tag">단백질 ${m.protein||0}g · 탄수 ${m.carbs||0}g · 지방 ${m.fat||0}g</div></div>
        <div class="meal-kcal">${m.calories}</div>
        <button class="more-btn" onclick="toggleDrop(event,'${escH(m.id)}')">⋮</button>
        <div class="dropdown-menu" id="drop-${escH(m.id)}">
          <div class="dropdown-item" onclick="editMeal('${escH(m.id)}')">✏️ 수정</div>
          <div class="dropdown-item" onclick="openReanalysis('${escH(m.id)}','${escH(m.image_url||'')}')">🔄 재분석</div>
          <div class="dropdown-item danger" onclick="deleteMeal('${escH(m.id)}')">🗑️ 삭제</div>
        </div>
      </div>`;
    });
  });
  wrap.innerHTML = html;
}

function toggleDrop(e, id) {
  e.stopPropagation();
  const menu = document.getElementById('drop-'+id);
  const wasOpen = menu.classList.contains('open');
  document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.remove('open'));
  if(!wasOpen) menu.classList.add('open');
}
document.addEventListener('click', () => document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.remove('open')));

async function editMeal(id) {
  try {
    const data = isGuestMode()
      ? getGuestMeals().find(meal => meal.id===id)
      : (await sbClient.from('meal_logs').select('*').eq('id',id).single()).data;
    if(!data) return;
    currentEditMealId = id;
    currentMealType = data.meal_type||'breakfast';
    clearForm();
    if(data.image_url) document.getElementById('preview-wrap').innerHTML=`<img src="${escH(data.image_url)}" alt="food">`;
    fillForm({food_name:data.food_name,calories:data.calories,protein:data.protein,carbs:data.carbs,fat:data.fat,quantity:data.quantity||''});
    const types=['breakfast','lunch','dinner','snack'];
    document.querySelectorAll('.mt-btn').forEach((b,i)=>b.classList.toggle('selected',types[i]===data.meal_type));
    document.getElementById('analysis-title').textContent='식사 수정';
    openOverlay();
  } catch(e){}
}

async function deleteMeal(id) {
  if(!confirm('식사 기록을 삭제할까요?')) return;
  try {
    if(isGuestMode()) saveGuestMeals(getGuestMeals().filter(meal => meal.id!==id));
    else await sbClient.from('meal_logs').delete().eq('id',id);
    loadHistoryData();
    loadHomeData();
  } catch(e){ alert('삭제에 실패했어요.'); }
}
