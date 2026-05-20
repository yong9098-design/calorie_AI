// 로컬 개발용 서버 — output/ 정적 파일 + /api/food-search 프록시
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env 파일 로드 — API_KEY 참조 전에 먼저 실행
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}
loadEnv();

// 로컬 개발 환경에서 한국 정부 API SSL 인증서 체인 문제 우회
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PORT = process.env.PORT || 3000;
const BASE_URL = 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

async function foodSearch(req, res) {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const q    = u.searchParams.get('q') ?? '';
  const page = u.searchParams.get('page') ?? '1';
  const rows = u.searchParams.get('rows') ?? '10';
  const apiKey = process.env.FOOD_DB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (!apiKey) {
    res.writeHead(500);
    return res.end(JSON.stringify({ error: 'FOOD_DB_API_KEY not set in .env or environment' }));
  }
  if (!q.trim()) {
    res.writeHead(200);
    return res.end('[]');
  }

  const apiUrl = new URL(BASE_URL);
  apiUrl.searchParams.set('serviceKey', apiKey);
  apiUrl.searchParams.set('type', 'json');
  apiUrl.searchParams.set('FOOD_NM_KR', q);
  apiUrl.searchParams.set('pageNo', page);
  apiUrl.searchParams.set('numOfRows', rows);

  try {
    const upstream = await fetch(apiUrl.toString());
    const data = await upstream.json();

    if (data?.header?.resultCode !== '00') {
      res.writeHead(200);
      return res.end('[]');
    }

    const rawItems = data?.body?.items ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    const mapped = items.map((item, i) => {
      const basis   = parseFloat(item.SERVING_SIZE) || 100;
      const serving = parseFloat(item.Z10500) || basis;
      const factor  = serving / basis;

      const kcal = parseFloat(item.AMT_NUM1) || 0;
      const prot = parseFloat(item.AMT_NUM3) || 0;
      const fat  = parseFloat(item.AMT_NUM4) || 0;
      const carb = parseFloat(item.AMT_NUM6) || 0;

      const scale = (base, f) => Math.round(base * factor * f * 10) / 10;

      return {
        id:       i + 1,
        name:     item.FOOD_NM_KR ?? '알 수 없음',
        category: item.FOOD_CAT1_NM ?? '',
        maker:    item.MAKER_NM ?? '',
        serving:  Math.round(serving),
        qty: 'medium',
        cals:    { small: scale(kcal, 0.7), medium: scale(kcal, 1.0), large: scale(kcal, 1.3) },
        protein: { small: scale(prot, 0.7), medium: scale(prot, 1.0), large: scale(prot, 1.3) },
        carb:    { small: scale(carb, 0.7), medium: scale(carb, 1.0), large: scale(carb, 1.3) },
        fat:     { small: scale(fat,  0.7), medium: scale(fat,  1.0), large: scale(fat,  1.3) },
      };
    });

    res.writeHead(200);
    res.end(JSON.stringify(mapped));
  } catch (e) {
    res.writeHead(502);
    res.end(JSON.stringify({ error: e.message }));
  }
}

function serveStatic(req, res) {
  const rawPath = req.url.split('?')[0];

  // 기본 경로: docs/mockups/food-db-mockup.html
  if (rawPath === '/' || rawPath === '/food-db-mockup.html') {
    const filePath = path.join(__dirname, 'docs', 'mockups', 'food-db-mockup.html');
    return fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(data);
    });
  }

  // 나머지 정적 파일은 output/ 에서 서빙 (index.html, icons, manifest 등)
  const filePath = path.join(__dirname, 'output', rawPath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end(`Not found: ${rawPath}`);
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/food-search')) {
    return foodSearch(req, res);
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n개발 서버 시작: http://localhost:${PORT}/food-db-mockup.html\n파일 위치: docs/mockups/food-db-mockup.html\n`);
  console.log(`API 키: ${process.env.FOOD_DB_API_KEY ? '✓ 로드됨' : '✗ FOOD_DB_API_KEY 없음'}`);
});
