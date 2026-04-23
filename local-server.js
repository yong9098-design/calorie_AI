const fs = require('fs');
const http = require('http');
const path = require('path');

const handleAnalyze = require('./api/analyze');
const handleConfig = require('./api/config');

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

function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function decorateResponse(res) {
  res.status = code => {
    res.statusCode = code;
    return res;
  };

  res.json = payload => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  return res;
}

function sendPlainText(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

function resolveStaticPath(urlPath) {
  const trimmedPath = urlPath.startsWith('/output/') ? urlPath.slice('/output'.length) : urlPath;
  const relativePath =
    trimmedPath === '/' ? 'index.html' : decodeURIComponent(trimmedPath.replace(/^\/+/, ''));
  const normalized = path.normalize(relativePath);
  const resolved = path.join(OUTPUT_DIR, normalized);

  if (!resolved.startsWith(OUTPUT_DIR)) return null;
  return resolved;
}

async function serveStatic(res, urlPath) {
  let filePath = resolveStaticPath(urlPath);

  if (!filePath) {
    return sendPlainText(res, 403, 'Forbidden');
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (error) {
    if (urlPath !== '/' && !path.extname(filePath)) {
      filePath = path.join(OUTPUT_DIR, 'index.html');
    }
  }

  if (!fs.existsSync(filePath)) {
    return sendPlainText(res, 404, 'Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

async function routeApi(req, res, pathname) {
  addCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  decorateResponse(res);

  if (pathname === '/api/config') {
    await handleConfig(req, res);
    return;
  }

  if (pathname === '/api/analyze') {
    await handleAnalyze(req, res);
    return;
  }

  res.status(404).json({ error: 'Not Found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/api/')) {
      await routeApi(req, res, pathname);
      return;
    }

    await serveStatic(res, pathname);
  } catch (error) {
    console.error(error);
    sendPlainText(res, 500, 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local server running at http://${DISPLAY_HOST}:${PORT}/`);
});
