// ═══════════════════════════════════════════
//  인증
// ═══════════════════════════════════════════
function switchAuthTab(tab) {
  const isL = tab==='login';
  document.getElementById('login-form').style.display = isL?'block':'none';
  document.getElementById('signup-form').style.display = isL?'none':'block';
  document.getElementById('tab-login').classList.toggle('active', isL);
  document.getElementById('tab-signup').classList.toggle('active', !isL);
  hideE('auth-error'); document.getElementById('auth-success').style.display='none';
}

function showAuthError(m) { const el=document.getElementById('auth-error'); el.textContent=m; el.style.display='block'; document.getElementById('auth-success').style.display='none'; }
function showAuthSuccess(m) { const el=document.getElementById('auth-success'); document.getElementById('auth-success-text').textContent=m; el.style.display='block'; document.getElementById('auth-error').style.display='none'; }

async function handleAuth(mode) {
  const btnId = mode==='login'?'login-btn':'signup-btn';
  hideE('auth-error');
  try {
    await ensureSupabaseClient(!sbClient);
    if(mode==='login') {
      const email = document.getElementById('login-email').value.trim();
      const pw = document.getElementById('login-pw').value;
      if(!email||!pw) { showAuthError('이메일과 비밀번호를 입력해 주세요'); return; }
      setBtn(btnId, true, '로그인 중...');
      const { data, error } = await sbClient.auth.signInWithPassword({ email, password:pw });
      if(error) throw error;
      currentUser = data.user;
      await syncOnboarding(currentUser.id);
      await loadProfile();
      showMain('home');
    } else {
      const email = document.getElementById('signup-email').value.trim();
      const pw = document.getElementById('signup-pw').value;
      const pw2 = document.getElementById('signup-pw2').value;
      if(!email||!pw) { showAuthError('이메일과 비밀번호를 입력해 주세요'); return; }
      if(pw.length<8) { showAuthError('비밀번호는 8자 이상이어야 해요'); return; }
      if(pw!==pw2) { showAuthError('비밀번호가 일치하지 않아요'); return; }
      setBtn(btnId, true, '가입 중...');
      const { data, error } = await sbClient.auth.signUp({ email, password:pw });
      if(error) throw error;
      if(data.session) {
        currentUser = data.user;
        await syncOnboarding(currentUser.id);
        await loadProfile();
        showMain('home');
      } else {
        showAuthSuccess('회원가입 완료! 이메일 인증 후 로그인해 주세요.');
        switchAuthTab('login');
      }
    }
  } catch(e) {
    const msgs = { invalid_credentials:'이메일 또는 비밀번호가 올바르지 않아요', email_not_confirmed:'이메일 인증이 필요해요', user_already_exists:'이미 가입된 이메일이에요' };
    showAuthError(msgs[e.message]||msgs[e.code]||e.message||'오류가 발생했어요');
  } finally { setBtn(btnId, false, mode==='login'?'로그인':'회원가입'); }
}

async function handleGuestLogin() {
  hideE('auth-error');
  document.getElementById('auth-success').style.display='none';
  const nickname = prompt('이름 또는 별명을 입력해 주세요');
  if(nickname===null) return;
  const name = nickname.trim();
  if(!name) { showAuthError('이름 또는 별명을 입력해 주세요.'); return; }
  setBtn('guest-btn', true, '시작 중...');
  try {
    profile = { daily_calorie_goal:2000, protein_goal:150, carb_goal:250, fat_goal:65, gemini_model:'flash' };
    currentUser = { id:'guest-local', is_guest:true, user_metadata:{ display_name:name } };
    saveGuestSession(currentUser);
    applyGuestProfile({ guest_nickname:name, ...(readJSON('onboarding_temp', {})||{}) });
    localStorage.removeItem('onboarding_temp');
    await loadProfile();
    showMain('home');
  } catch(e) {
    showAuthError(String(e?.message||'비회원 시작에 실패했어요.'));
  } finally {
    setBtn('guest-btn', false, '비회원으로 시작');
  }
}

async function syncOnboarding(userId) {
  const temp = JSON.parse(localStorage.getItem('onboarding_temp')||'{}');
  if(!temp.gender||!sbClient) return;
  try { await sbClient.from('profiles').upsert({ id:userId, ...temp }); profile={...profile,...temp}; } catch(e){}
  localStorage.removeItem('onboarding_temp');
}

async function signOut() {
  const guest = isGuestMode();
  const msg = guest
    ? '비회원 세션에서 나갈까요? 저장된 비회원 데이터는 이 브라우저에 유지됩니다.'
    : '로그아웃 하시겠어요?';
  if(!confirm(msg)) return;
  if(!guest) await sbClient?.auth.signOut();
  currentUser = null;
  profile = { daily_calorie_goal:2000, protein_goal:150, carb_goal:250, fat_goal:65, gemini_model:'flash' };
  if(guest) clearGuestSession();
  localStorage.removeItem('onboarding_complete');
  showScreen('auth');
}
