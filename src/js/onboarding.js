// ═══════════════════════════════════════════
//  온보딩
// ═══════════════════════════════════════════
function goStep(n) {
  if(n===2 && !validateStep1()) return;
  if(n===4 && !validateStep3()) return;
  if(n===4) renderTDEE();
  document.getElementById('onb-step'+currentStep).style.display='none';
  currentStep = n;
  document.getElementById('onb-step'+n).style.display='block';
  for(let i=1;i<=4;i++) document.getElementById('dot'+i).classList.toggle('active', i<=n);
}

function selectGender(g) {
  onb.gender = g;
  document.getElementById('gender-male').classList.toggle('selected', g==='male');
  document.getElementById('gender-female').classList.toggle('selected', g==='female');
}
function selectActivity(level, mult, el) {
  onb.activity = level; onb.actMult = mult;
  document.querySelectorAll('.activity-item').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}
function selectGoal(type, el) {
  onb.goal = type;
  document.querySelectorAll('.goal-card').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}

function validateStep1() {
  hideE('onb-err1');
  if(!onb.gender) { showE('onb-err1','성별을 선택해 주세요'); return false; }
  const a=parseInt(document.getElementById('inp-age').value);
  const h=parseFloat(document.getElementById('inp-height').value);
  const w=parseFloat(document.getElementById('inp-weight').value);
  if(!a||a<10||a>99) { showE('onb-err1','나이를 올바르게 입력해 주세요'); return false; }
  if(!h||h<100||h>250) { showE('onb-err1','키를 올바르게 입력해 주세요 (cm)'); return false; }
  if(!w||w<30||w>300) { showE('onb-err1','몸무게를 올바르게 입력해 주세요 (kg)'); return false; }
  onb.age=a; onb.height=h; onb.weight=w;
  return true;
}

function validateStep3() {
  hideE('onb-err3');
  if(!onb.activity) { showE('onb-err3','활동량을 선택해 주세요'); return false; }
  if(!onb.goal) { showE('onb-err3','목표를 선택해 주세요'); return false; }
  if(!document.getElementById('privacy-consent').checked) { showE('onb-err3','개인정보 처리에 동의해 주세요'); return false; }
  return true;
}

function calcTDEE() {
  let bmr = onb.gender==='male'
    ? 88.362 + (13.397*onb.weight) + (4.799*onb.height) - (5.677*onb.age)
    : 447.593 + (9.247*onb.weight) + (3.098*onb.height) - (4.330*onb.age);
  let tdee = bmr * onb.actMult;
  if(onb.goal==='lose') tdee -= 500;
  else if(onb.goal==='gain') tdee += 300;
  return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

function renderTDEE() {
  const { bmr, tdee } = calcTDEE();
  document.getElementById('tdee-display').textContent = tdee;
  document.getElementById('inp-tdee-edit').value = tdee;
  const adj = onb.goal==='lose'?'−500':onb.goal==='gain'?'+300':'±0';
  document.getElementById('tdee-breakdown').innerHTML = `
    <div class="tdee-row"><span class="tdee-label">기초대사량 (BMR)</span><span class="tdee-val">${bmr} kcal</span></div>
    <div class="tdee-row"><span class="tdee-label">활동계수</span><span class="tdee-val">× ${onb.actMult}</span></div>
    <div class="tdee-row"><span class="tdee-label">목표 보정</span><span class="tdee-val">${adj} kcal</span></div>
  `;
  const p=Math.round(tdee*0.3/4), c=Math.round(tdee*0.45/4), f=Math.round(tdee*0.25/9);
  document.getElementById('macro-preview').innerHTML = `
    <div class="macro-box"><div class="m-val">${p}g</div><div class="m-label">단백질</div></div>
    <div class="macro-box"><div class="m-val">${c}g</div><div class="m-label">탄수화물</div></div>
    <div class="macro-box"><div class="m-val">${f}g</div><div class="m-label">지방</div></div>
  `;
}

async function saveOnboarding() {
  const custom = parseInt(document.getElementById('inp-tdee-edit').value);
  const { tdee: calc } = calcTDEE();
  const tdee = (custom && custom>500) ? custom : calc;
  const prot = Math.round(tdee*0.3/4), carb = Math.round(tdee*0.45/4), fat = Math.round(tdee*0.25/9);
  const data = {
    gender:onb.gender, age:onb.age, height_cm:onb.height, weight_kg:onb.weight,
    activity_level:onb.activity, goal_type:onb.goal,
    daily_calorie_goal:tdee, protein_goal:prot, carb_goal:carb, fat_goal:fat, gemini_model:'flash'
  };
  localStorage.setItem('onboarding_temp', JSON.stringify(data));
  localStorage.setItem('onboarding_complete','true');
  showScreen('auth');
}

function resetOnboarding() {
  if(!confirm('온보딩을 다시 진행할까요?')) return;
  localStorage.removeItem('onboarding_complete');
  localStorage.removeItem('onboarding_temp');
  currentStep=1;
  document.querySelectorAll('[id^="onb-step"]').forEach((el,i)=>el.style.display=i===0?'block':'none');
  for(let i=1;i<=4;i++) document.getElementById('dot'+i).classList.toggle('active',i===1);
  showScreen('onboarding');
}
