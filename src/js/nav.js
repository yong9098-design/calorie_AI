// ═══════════════════════════════════════════
//  화면 전환
// ═══════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+id)?.classList.add('active');
  const noNav = ['onboarding','auth'];
  const isNav = !noNav.includes(id);
  document.getElementById('bottom-nav').classList.toggle('visible', isNav);
  document.getElementById('fab').classList.toggle('visible', id==='home');
}

function showMain(tab) {
  showScreen(tab);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-'+tab)?.classList.add('active');
  if(tab==='home') loadHomeData();
  else if(tab==='history') loadHistoryData();
  else if(tab==='stats') loadStatsData();
  else if(tab==='settings') loadSettingsUI();
}
