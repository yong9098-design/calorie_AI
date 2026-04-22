// ═══════════════════════════════════════════
//  통계
// ═══════════════════════════════════════════
function switchStatsTab(mode, el) {
  currentStatsMode = mode;
  document.querySelectorAll('.stats-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  loadStatsData();
}

async function loadStatsData() {
  const days = currentStatsMode==='week'?7:30;
  const endD = new Date(); endD.setHours(23,59,59,999);
  const startD = new Date(); startD.setDate(startD.getDate()-(days-1)); startD.setHours(0,0,0,0);
  if(isGuestMode()) {
    renderChart(getGuestMealsInRange(startD.toISOString(), endD.toISOString()), days);
    return;
  }
  if(!sbClient||!currentUser) return;
  try {
    const meals = unwrapSupabase(
      await sbClient.from('meal_logs').select('calories,logged_at')
        .eq('user_id',currentUser.id).gte('logged_at',startD.toISOString()).lte('logged_at',endD.toISOString()),
      '통계를 불러오지 못했어요.'
    ) || [];
    renderChart(meals, days);
  } catch(e){ console.error(e); }
}

function renderChart(meals, days) {
  const goal = profile.daily_calorie_goal||2000;
  const map = {};
  for(let i=days-1;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); map[localDS(d)]=0; }
  meals.forEach(m=>{ const ds=localDS(new Date(m.logged_at)); if(map[ds]!==undefined) map[ds]+=m.calories||0; });
  const entries = Object.entries(map);
  const maxV = Math.max(goal*1.2, ...Object.values(map), 1);
  const goalPct = (goal/maxV)*100;
  let bars='', total=0, cnt=0;
  entries.forEach(([ds,kcal])=>{
    const h = (kcal/maxV)*100;
    const over = kcal>goal;
    const label = ds.slice(5).replace('-','/');
    bars+=`<div class="bar-col"><div class="bar-kcal-txt">${kcal||''}</div><div class="bar-body${over?' over':''}" style="height:${h}%"></div><div class="bar-date">${label}</div></div>`;
    if(kcal>0){total+=kcal;cnt++;}
  });
  document.getElementById('bar-chart').innerHTML=`<div class="goal-line" style="bottom:calc(${goalPct}% + 28px)"></div>${bars}`;
  const avg = cnt>0?Math.round(total/cnt):0;
  document.getElementById('stats-summary').innerHTML=`
    <div class="stat-box"><div class="sb-val">${avg}</div><div class="sb-label">평균 kcal</div></div>
    <div class="stat-box"><div class="sb-val">${cnt}</div><div class="sb-label">기록 일수</div></div>
    <div class="stat-box"><div class="sb-val">${goal}</div><div class="sb-label">목표 kcal</div></div>
  `;
}
