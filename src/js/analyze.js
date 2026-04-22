// ═══════════════════════════════════════════
//  이미지 분석 / 식사 저장
// ═══════════════════════════════════════════
document.getElementById('fab').addEventListener('click', () => {
  currentEditMealId = null; currentBase64 = null; currentImageMime = 'image/jpeg';
  clearForm();
  document.getElementById('img-input').value='';
  document.getElementById('img-input').click();
});

document.getElementById('img-input').addEventListener('change', async e => {
  const file = e.target.files[0]; if(!file) return;
  showLoad('AI가 분석하고 있어요...');
  currentImageMime = file.type||'image/jpeg';
  try {
    currentBase64 = await toB64(file);
    setPreview(currentBase64, currentImageMime);
    await runGemini(currentBase64, currentImageMime);
  } catch(err) { hideLoad(); showFallback(); }
});

const toB64 = file => new Promise((res,rej) => { const r=new FileReader(); r.onload=e=>res(e.target.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file); });

function setPreview(b64, mime) {
  document.getElementById('preview-wrap').innerHTML = `<img src="data:${mime};base64,${b64}" alt="preview">`;
}

async function runGemini(b64, mime) {
  const prompt = `이 음식 사진을 분석해서 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 JSON만 응답하세요.
{"food_name":"음식명(한국어)","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"quantity":"1인분"}`;
  try {
    const { data:{ session } = {} } = sbClient ? await sbClient.auth.getSession() : { data:{ session:null } };
    const res = await fetch(apiUrl('/api/analyze'), {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        ...(session?.access_token ? { Authorization:`Bearer ${session.access_token}` } : {})
      },
      body: JSON.stringify({
        image:{ mimeType:mime, data:b64 }
      })
    });
    const json = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(json.error||'AI analysis failed');
    const text = json.text||'';
    const result = parseGemini(text);
    hideLoad();
    fillForm(result);
    document.getElementById('ai-fail-banner').style.display='none';
    document.getElementById('analysis-title').textContent='음식 분석 결과';
    openOverlay();
  } catch(e) { hideLoad(); showFallback(); }
}

function parseGemini(text) {
  try { const m=text.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); } catch(e){}
  const get = k => { const m=text.match(new RegExp(`"${k}"\\s*:\\s*([^,}\\n]+)`)); return m?m[1].replace(/"/g,'').trim():null; };
  return { food_name:get('food_name')||'', calories:parseFloat(get('calories'))||0, protein:parseFloat(get('protein'))||0, carbs:parseFloat(get('carbs'))||0, fat:parseFloat(get('fat'))||0, quantity:get('quantity')||'1인분' };
}

function fillForm(r) {
  document.getElementById('inp-food').value = r.food_name||'';
  document.getElementById('inp-cal').value = r.calories||0;
  document.getElementById('inp-prot').value = r.protein||0;
  document.getElementById('inp-carb').value = r.carbs||0;
  document.getElementById('inp-fat').value = r.fat||0;
  document.getElementById('inp-qty').value = r.quantity||'1인분';
}

function clearForm() {
  ['inp-food','inp-cal','inp-prot','inp-carb','inp-fat','inp-qty'].forEach(id => document.getElementById(id).value='');
  document.getElementById('preview-wrap').innerHTML='<div class="img-placeholder">📷</div>';
  document.getElementById('ai-fail-banner').style.display='none';
  hideE('save-err');
  currentMealType='breakfast';
  document.querySelectorAll('.mt-btn').forEach((b,i)=>b.classList.toggle('selected',i===0));
}

function showFallback() {
  document.getElementById('ai-fail-banner').style.display='block';
  document.getElementById('analysis-title').textContent='직접 입력';
  openOverlay();
}

function openOverlay() { document.getElementById('analysis-overlay').classList.add('active'); }
function closeAnalysis() { document.getElementById('analysis-overlay').classList.remove('active'); currentEditMealId=null; }

function selectMealType(type, el) {
  currentMealType = type;
  document.querySelectorAll('.mt-btn').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
}

async function saveMeal() {
  const food = document.getElementById('inp-food').value.trim();
  const cal = parseInt(document.getElementById('inp-cal').value)||0;
  hideE('save-err');
  if(!food) { showE('save-err','음식명을 입력해 주세요.'); return; }
  if(cal<=0) { showE('save-err','칼로리를 입력해 주세요.'); return; }
  if(!currentUser) { showE('save-err','먼저 로그인 또는 비회원 시작을 해주세요.'); return; }
  setBtn('save-btn',true,'저장 중...');
  try {
    const row = {
      id: currentEditMealId || genId(),
      user_id: isGuestMode() ? 'guest-local' : currentUser.id,
      meal_type: currentMealType,
      food_name: food,
      calories: cal,
      protein: parseFloat(document.getElementById('inp-prot').value)||0,
      carbs: parseFloat(document.getElementById('inp-carb').value)||0,
      fat: parseFloat(document.getElementById('inp-fat').value)||0,
      quantity: document.getElementById('inp-qty').value||'1인분',
      image_url: currentBase64 ? `data:${currentImageMime};base64,${currentBase64}` : null,
      logged_at: new Date().toISOString()
    };
    if(isGuestMode()) {
      let meals = getGuestMeals();
      meals = currentEditMealId ? meals.map(meal => meal.id===currentEditMealId ? row : meal) : [...meals, row];
      saveGuestMeals(sortMeals(meals));
    } else {
      const payload = { ...row };
      delete payload.id;
      if(currentEditMealId) {
        unwrapSupabase(await sbClient.from('meal_logs').update(payload).eq('id',currentEditMealId), '식사 수정에 실패했어요.');
      } else {
        unwrapSupabase(await sbClient.from('meal_logs').insert(payload), '식사 저장에 실패했어요.');
      }
    }
    closeAnalysis();
    loadHomeData();
    if(document.getElementById('screen-history').classList.contains('active')) loadHistoryData();
    if(document.getElementById('screen-stats').classList.contains('active')) loadStatsData();
  } catch(e) { showE('save-err','저장에 실패했어요. '+e.message); }
  finally { setBtn('save-btn',false,'저장'); }
}
