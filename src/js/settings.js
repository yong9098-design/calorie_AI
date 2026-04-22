// ═══════════════════════════════════════════
//  설정
// ═══════════════════════════════════════════
function loadSettingsUI() {
  document.getElementById('set-cal-goal').value = profile.daily_calorie_goal||2000;
  document.getElementById('set-prot-goal').value = profile.protein_goal||150;
  document.getElementById('set-carb-goal').value = profile.carb_goal||250;
  document.getElementById('set-fat-goal').value = profile.fat_goal||65;
  selectModel(profile.gemini_model||'flash', false);
}

function selectModel(m, save=true) {
  document.getElementById('model-flash').classList.toggle('selected', m==='flash');
  document.getElementById('model-pro').classList.toggle('selected', m==='pro');
  if(save) { profile.gemini_model=m; updateProfileModel(m); }
}

async function updateProfileModel(m) {
  if(isGuestMode()) {
    profile = { ...profile, gemini_model:m };
    saveGuestProfile(profile);
    return;
  }
  if(!sbClient||!currentUser) return;
  try { await sbClient.from('profiles').update({gemini_model:m}).eq('id',currentUser.id); } catch(e){}
}

async function saveGoals() {
  const cal=parseInt(document.getElementById('set-cal-goal').value)||2000;
  const prot=parseInt(document.getElementById('set-prot-goal').value)||150;
  const carb=parseInt(document.getElementById('set-carb-goal').value)||250;
  const fat=parseInt(document.getElementById('set-fat-goal').value)||65;
  profile={...profile,daily_calorie_goal:cal,protein_goal:prot,carb_goal:carb,fat_goal:fat};
  if(isGuestMode()) saveGuestProfile(profile);
  else if(sbClient&&currentUser) {
    try { await sbClient.from('profiles').upsert({id:currentUser.id,daily_calorie_goal:cal,protein_goal:prot,carb_goal:carb,fat_goal:fat}); } catch(e){}
  }
  alert('목표가 저장되었어요!');
}
