// ═══════════════════════════════════════════
//  설정 로드 / Supabase 초기화
// ═══════════════════════════════════════════
function getEmbeddedRuntimeConfig() {
  if(!EMBEDDED_RUNTIME_CONFIG?.supabaseUrl || !EMBEDDED_RUNTIME_CONFIG?.supabaseAnonKey) {
    return null;
  }
  return EMBEDDED_RUNTIME_CONFIG;
}

async function fetchRuntimeConfig() {
  const res = await fetch(apiUrl('/api/config'), { cache:'no-store' });
  const json = await res.json().catch(() => ({}));
  if(!res.ok) {
    const fallback = res.status===404
      ? '/api/config endpoint not found'
      : `Runtime config load failed (${res.status})`;
    throw new Error(json.error||fallback);
  }
  return json;
}

async function loadRuntimeConfig(forceReload=false) {
  if(forceReload) runtimeConfig = null;
  if(runtimeConfig) return runtimeConfig;

  const embeddedConfig = getEmbeddedRuntimeConfig();

  try {
    runtimeConfig = await fetchRuntimeConfig();
    return runtimeConfig;
  } catch(error) {
    if(embeddedConfig) {
      console.warn('Falling back to embedded runtime config.', error);
      runtimeConfig = embeddedConfig;
      return runtimeConfig;
    }
    throw error;
  }
}

function getFriendlyInitError(error) {
  const message = String(error?.message||'');
  if(message.includes('SUPABASE_URL') || message.includes('SUPABASE_ANON_KEY')) {
    return '서버 환경변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 설정되지 않았어요.';
  }
  if(message.includes('/api/config endpoint not found')) {
    return '배포 서버의 /api/config 경로를 찾지 못했어요. Vercel 라우팅 또는 실행 환경을 확인해 주세요.';
  }
  if(location.protocol==='file:' && message.includes('Failed to fetch')) {
    return 'output/index.html을 파일로 직접 열면 보안용 /api 서버에 연결할 수 없어요. `node server.js` 실행 후 `http://127.0.0.1:3000/` 으로 접속해 주세요.';
  }
  if(message.includes('Failed to fetch')) {
    return '서버 설정 요청에 실패했어요. 네트워크 또는 배포 상태를 확인해 주세요.';
  }
  return message||'앱 설정을 불러오지 못했어요.';
}

async function ensureSupabaseClient(forceReload=false) {
  if(sbClient && !forceReload) return sbClient;
  const cfg = await loadRuntimeConfig(forceReload);
  if(!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) {
    throw new Error('Supabase config is incomplete');
  }
  sbClient = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  return sbClient;
}
