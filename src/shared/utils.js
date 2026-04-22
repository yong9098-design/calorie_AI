// ═══════════════════════════════════════════
//  유틸
// ═══════════════════════════════════════════
const escH = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const fmtDate = d => { const D=['일','월','화','수','목','금','토']; return `${d.getMonth()+1}월 ${d.getDate()}일 (${D[d.getDay()]})`; };
const localDS = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const getDR = d => { const s=new Date(d); s.setHours(0,0,0,0); const e=new Date(d); e.setHours(23,59,59,999); return {start:s.toISOString(),end:e.toISOString()}; };
const showLoad = t => { document.getElementById('loading-text').textContent=t||'처리 중...'; document.getElementById('loading-overlay').style.display='flex'; };
const hideLoad = () => { document.getElementById('loading-overlay').style.display='none'; };
const showE = (id,m) => { const el=document.getElementById(id); if(el){el.textContent=m;el.style.display='block';} };
const hideE = id => { const el=document.getElementById(id); if(el) el.style.display='none'; };
const setBtn = (id,loading,txt) => { const b=document.getElementById(id); if(!b)return; b.disabled=loading; b.innerHTML=loading?`<span style="width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block"></span> ${txt}`:txt; };
const apiUrl = path => location.protocol==='file:' ? `${LOCAL_API_ORIGIN}${path}` : path;
const isGuestMode = () => !!currentUser?.is_guest;
function getFriendlySupabaseError(error, fallbackMessage='Supabase request failed') {
  const message = String(error?.message || fallbackMessage);
  if(error?.code === 'PGRST205' || message.includes('schema cache')) {
    if(message.includes('public.meal_logs')) return 'Supabase에 meal_logs 테이블이 없어요. docs/supabase_setup.sql을 SQL Editor에서 실행해 주세요.';
    if(message.includes('public.profiles')) return 'Supabase에 profiles 테이블이 없어요. docs/supabase_setup.sql을 SQL Editor에서 실행해 주세요.';
    return 'Supabase 초기 테이블이 없어요. docs/supabase_setup.sql을 SQL Editor에서 실행해 주세요.';
  }
  return message;
}
function unwrapSupabase(result, fallbackMessage='Supabase request failed') {
  if(result?.error) {
    throw new Error(getFriendlySupabaseError(result.error, fallbackMessage));
  }
  return result?.data;
}
const readJSON = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)||'null'); return v ?? fallback; } catch(e) { return fallback; } };
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getGuestSession = () => readJSON(GUEST_SESSION_KEY, null);
const saveGuestSession = session => writeJSON(GUEST_SESSION_KEY, session);
const clearGuestSession = () => localStorage.removeItem(GUEST_SESSION_KEY);
const getGuestProfile = () => readJSON(GUEST_PROFILE_KEY, null);
const saveGuestProfile = data => writeJSON(GUEST_PROFILE_KEY, data);
const getGuestMeals = () => {
  const meals = readJSON(GUEST_MEALS_KEY, []);
  return Array.isArray(meals) ? meals : [];
};
const saveGuestMeals = meals => writeJSON(GUEST_MEALS_KEY, meals);
const genId = () => globalThis.crypto?.randomUUID?.() || `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const sortMeals = meals => [...meals].sort((a,b) => new Date(a.logged_at) - new Date(b.logged_at));
function getGuestMealsInRange(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return sortMeals(getGuestMeals().filter(meal => {
    const t = new Date(meal.logged_at).getTime();
    return t >= s && t <= e;
  }));
}
function applyGuestProfile(temp = {}) {
  const stored = getGuestProfile() || {};
  profile = { ...profile, ...stored, ...temp };
  saveGuestProfile(profile);
}
