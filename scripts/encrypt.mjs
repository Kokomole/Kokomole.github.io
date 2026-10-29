/**
 * 构建后加密：把 dist/ 下所有 HTML 变成密码页。
 *
 * 依赖两个环境变量（GitHub Secrets）：
 *   BLOG_PASSWORD  访问密码
 *   BLOG_SALT      固定盐（32 位 hex）。盐必须固定，否则所有「记住我」的读者会被踢下线。
 *
 * 本地想跳过加密：SKIP_ENCRYPT=1 npm run build
 */
import { spawnSync } from 'node:child_process';
import { rmSync, renameSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'node_modules', 'staticrypt', 'cli', 'index.js');
const DIST = path.join(ROOT, 'dist');

function fail(msg) {
  console.error(`\n[encrypt] ${msg}\n`);
  // 让失败原因直接显示在 Actions 运行页顶部，不用钻进折叠的日志里找
  const oneLine = String(msg).replace(/\r?\n/g, ' ');
  console.error(`::error::encrypt: ${oneLine}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## 加密失败\n\n\`\`\`\n${msg}\n\`\`\`\n\n排查见 \`部署清单.md\` 的「报错在 Encrypt HTML 这一步」。\n`
      );
    } catch {
      /* summary 写不进去不影响退出码 */
    }
  }
  process.exit(1);
}

if (process.env.SKIP_ENCRYPT === '1') {
  console.log('[encrypt] SKIP_ENCRYPT=1，跳过加密');
  process.exit(0);
}

const password = (process.env.BLOG_PASSWORD || '').trim();
const salt = (process.env.BLOG_SALT || '').trim().toLowerCase();

console.log(`[encrypt] BLOG_PASSWORD: ${password ? `已设置（${password.length} 位）` : '缺失'}`);
console.log(`[encrypt] BLOG_SALT: ${salt ? `已设置（${salt.length} 位）` : '缺失'}`);

if (!password) {
  fail('缺少 BLOG_PASSWORD。去 Settings → Secrets and variables → Actions 建一个同名 secret。');
}
if (!/^[0-9a-f]{32}$/.test(salt)) {
  fail(
    'BLOG_SALT 必须是 32 位十六进制字符串（例如 e3ffebfb9e8ef412156eded2f93cfe4e）。' +
      `当前长度 ${salt.length}，内容是否含空格或换行？`
  );
}
if (!existsSync(path.join(DIST, 'index.html'))) {
  fail('dist/index.html 不存在，上一步构建可能失败了。');
}
if (!existsSync(CLI)) {
  fail(`找不到 staticrypt：${CLI}。说明 npm install 没装上它（devDependencies 被跳过了？）。`);
}

// 直接调用 CLI 入口，绕开 npx（npx 在不同 npm 版本里参数行为不一致，是之前 CI 失败的原因之一）
const args = [
  CLI,
  'dist',
  '-r',
  '-d',
  'dist_enc',
  '--config',
  'false',
  '--salt',
  salt,
  '--remember',
  '30',
  '--short',
  '--template-title',
  '2014色彩漫游',
  '--template-button',
  '进入',
  '--template-placeholder',
  '输入密码',
  '--template-remember',
  '记住我 30 天',
  '--template-error',
  '密码不对，再试一次',
  '--template-color-primary',
  '#1b1a17',
  '--template-color-secondary',
  '#fdfdf9',
];

console.log('[encrypt] 开始加密 dist/ …');
// 捕获输出：失败时把 staticrypt 自己的报错原样带回运行页面
const res = spawnSync(process.execPath, args, {
  cwd: ROOT,
  encoding: 'utf8',
  env: { ...process.env, STATICRYPT_PASSWORD: password },
});

if (res.stdout) process.stdout.write(res.stdout);
if (res.stderr) process.stderr.write(res.stderr);

if (res.error) fail(`无法启动 staticrypt：${res.error.message}`);
if (res.status !== 0) {
  const detail = (res.stderr || res.stdout || '').trim().split('\n').slice(-12).join('\n');
  fail(`staticrypt 退出码 ${res.status}\n\n${detail}`);
}

const encDist = path.join(ROOT, 'dist_enc', 'dist');
if (!existsSync(encDist)) {
  fail('没找到 dist_enc/dist，staticrypt 的输出结构可能变了。');
}

rmSync(DIST, { recursive: true, force: true });
renameSync(encDist, DIST);
rmSync(path.join(ROOT, 'dist_enc'), { recursive: true, force: true });

console.log('[encrypt] 完成 → dist/');
