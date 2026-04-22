// build.js — src/ 소스 파일들을 output/index.html 하나로 조립
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'output', 'index.html');

// 1. HTML 뼈대 읽기
let html = fs.readFileSync(path.join(SRC, 'shell.html'), 'utf8');

// 2. CSS 인라인 삽입
const css = fs.readFileSync(path.join(SRC, 'styles', 'main.css'), 'utf8');
html = html.replace('<!--BUILD:CSS-->', css);

// 3. 화면 HTML 조립 (DOM 순서 고정)
const screenFiles = [
  'screens/onboarding.html',
  'screens/auth.html',
  'screens/home.html',
  'screens/history.html',
  'screens/stats.html',
  'screens/settings.html',
  'shared/overlays.html',
];
const screensHtml = screenFiles
  .map(f => fs.readFileSync(path.join(SRC, f), 'utf8'))
  .join('\n\n');
html = html.replace('<!--BUILD:SCREENS-->', screensHtml);

// 4. JS 파일 연결 (의존성 순서 — 절대 변경하지 마세요)
const jsFiles = [
  'shared/state.js',
  'shared/utils.js',
  'js/config.js',
  'js/nav.js',
  'js/init.js',
  'js/onboarding.js',
  'js/auth.js',
  'js/home.js',
  'js/analyze.js',
  'js/history.js',
  'js/reanalysis.js',
  'js/stats.js',
  'js/settings.js',
  'js/boot.js',
];
const js = jsFiles
  .map(f => {
    const content = fs.readFileSync(path.join(SRC, f), 'utf8');
    return `// ── ${f} ──\n${content}`;
  })
  .join('\n\n');
html = html.replace('<!--BUILD:JS-->', `<script>\n${js}\n</script>`);

// 5. output/ 디렉토리 확인 후 파일 저장
fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

const sizeKB = Math.round(fs.statSync(OUT).size / 1024);
console.log(`✅ 빌드 완료: ${OUT}`);
console.log(`   파일 크기: ${sizeKB} KB`);
console.log(`   소스 파일: ${screenFiles.length}개 HTML + ${jsFiles.length}개 JS + 1개 CSS`);
