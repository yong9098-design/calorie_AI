// ═══════════════════════════════════════════
//  초기화
// ═══════════════════════════════════════════
async function initApp() {
  try {
    appInitError = '';
    await ensureSupabaseClient(true);
    if(sbClient) {
      const { data: { session } } = await sbClient.auth.getSession();
      if(session) {
        currentUser = session.user;
        await loadProfile();
        showMain('home');
        return;
      }
    }
    const guestSession = getGuestSession();
    if(guestSession) {
      currentUser = guestSession;
      await loadProfile();
      showMain('home');
      return;
    }
    const done = localStorage.getItem('onboarding_complete');
    const temp = localStorage.getItem('onboarding_temp');
    if(done === 'true' || temp) showScreen('auth');
    else showScreen('onboarding');
  } catch(e) {
    console.error(e);
    appInitError = getFriendlyInitError(e);
    const guestSession = getGuestSession();
    if(guestSession) {
      currentUser = guestSession;
      await loadProfile();
      showMain('home');
      return;
    }
    const done = localStorage.getItem('onboarding_complete');
    const temp = localStorage.getItem('onboarding_temp');
    if(done === 'true' || temp) {
      showScreen('auth');
      showAuthError(appInitError);
    } else {
      showScreen('onboarding');
    }
  }
}

async function loadProfile() {
  if(isGuestMode()) {
    applyGuestProfile();
    return;
  }
  if(!sbClient || !currentUser) return;
  try {
    const { data } = await sbClient.from('profiles').select('*').eq('id', currentUser.id).single();
    if(data) profile = { ...profile, ...data };
    else await sbClient.from('profiles').upsert({ id: currentUser.id, ...profile });
  } catch(e) {}
}
