// ═══════════════════════════════════════════
//  재분석
// ═══════════════════════════════════════════
function openReanalysis(mealId, imageUrl) {
  document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.remove('open'));
  currentReanalyzeMeal = { id:mealId, imageUrl:imageUrl||null };
  currentEditMealId = mealId;
  document.getElementById('ra-saved-btn').disabled = !imageUrl;
  document.getElementById('reanalysis-modal').classList.add('active');
}
function closeReanalysis() { document.getElementById('reanalysis-modal').classList.remove('active'); currentReanalyzeMeal=null; }

async function reanalyzeSaved() {
  closeReanalysis();
  if(!currentReanalyzeMeal?.imageUrl) return;
  showLoad('저장된 이미지로 재분석 중...');
  try {
    const res = await fetch(currentReanalyzeMeal.imageUrl);
    const blob = await res.blob();
    const mime = blob.type||'image/jpeg';
    const b64 = await new Promise(resolve => { const r=new FileReader(); r.onload=e=>resolve(e.target.result.split(',')[1]); r.readAsDataURL(blob); });
    currentBase64=b64; currentImageMime=mime;
    clearForm();
    setPreview(b64,mime);
    await runGemini(b64,mime);
  } catch(e) { hideLoad(); showFallback(); }
}

function reanalyzeNew() {
  closeReanalysis();
  clearForm();
  document.getElementById('img-input').value='';
  document.getElementById('img-input').click();
}
