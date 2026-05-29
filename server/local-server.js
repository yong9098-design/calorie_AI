import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env / .env.local 로드 (로컬 개발용 — Vercel 배포 시에는 대시보드 환경변수 사용)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] == null || process.env[match[1]] === '') {
      process.env[match[1]] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.local'));

// Edge Runtime 핸들러를 env 로드 후 import (process.env가 먼저 채워져야 함)
const { default: handleAnalyze } = await import('./api/analyze.js');
const { default: handleConfig } = await import('./api/config.js');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);
const OUTPUT_DIR = path.join(__dirname, 'output');
const DISPLAY_HOST = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

// ── Node.js http ↔ Web API Request/Response 브릿지 ──

async function toWebRequest(nodeReq) {
  const url = new URL(nodeReq.url, `http://${nodeReq.headers.host || 'localhost'}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeReq.headers)) {
    if (Array.isArray(value)) value.forEach(v => headers.append(key, v));
    else if (value != null) headers.set(key, String(value));
  }

  let body = null;
  if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of nodeReq) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    if (buf.length > 0) body = buf;
  }

  return new Request(url.toString(), { method: nodeReq.method, headers, body });
}

async function sendWebResponse(webRes, nodeRes) {
  nodeRes.statusCode = webRes.status;
  for (const [key, value] of webRes.headers.entries()) {
    nodeRes.setHeader(key, value);
  }
  const buf = await webRes.arrayBuffer();
  nodeRes.end(Buffer.from(buf));
}

// ── CORS ──

function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

// ── 정적 파일 서빙 ──

function resolveStaticPath(urlPath) {
  const trimmedPath = urlPath.startsWith('/output/') ? urlPath.slice('/output'.length) : urlPath;
  const relativePath =
    trimmedPath === '/' ? 'index.html' : decodeURIComponent(trimmedPath.replace(/^\/+/, ''));
  const normalized = path.normalize(relativePath);
  const resolved = path.join(OUTPUT_DIR, normalized);
  if (!resolved.startsWith(OUTPUT_DIR)) return null;
  return resolved;
}

function sendPlainText(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

async function serveStatic(res, urlPath) {
  let filePath = resolveStaticPath(urlPath);
  if (!filePath) return sendPlainText(res, 403, 'Forbidden');

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    if (urlPath !== '/' && !path.extname(filePath)) {
      filePath = path.join(OUTPUT_DIR, 'index.html');
    }
  }

  if (!fs.existsSync(filePath)) return sendPlainText(res, 404, 'Not Found');

  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

// ── API 라우팅 ──

async function routeApi(nodeReq, nodeRes, pathname) {
  addCorsHeaders(nodeRes);

  if (nodeReq.method === 'OPTIONS') {
    nodeRes.statusCode = 204;
    nodeRes.end();
    return;
  }

  const webReq = await toWebRequest(nodeReq);
  let webRes;

  if (pathname === '/api/config') {
    webRes = await handleConfig(webReq);
  } else if (pathname === '/api/analyze') {
    webRes = await handleAnalyze(webReq);
  } else {
    webRes = new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await sendWebResponse(webRes, nodeRes);
}

// ── HTTP 서버 ──

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/api/')) {
      await routeApi(req, res, pathname);
    } else {
      await serveStatic(res, pathname);
    }
  } catch (error) {
    console.error(error);
    sendPlainText(res, 500, 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local server running at http://${DISPLAY_HOST}:${PORT}/`);
});
