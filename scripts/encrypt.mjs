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
import { rmSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

function run(args) {
  const res = spawnSync(npx, ['--no-install', ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
    shell: isWin,
  });
  if (res.status !== 0) {
    throw new Error(`staticrypt 退出码 ${res.status}`);
  }
}

const password = process.env.BLOG_PASSWORD;
const salt = process.env.BLOG_SALT;

if (process.env.SKIP_ENCRYPT === '1') {
  console.log('[encrypt] SKIP_ENCRYPT=1，跳过加密');
  process.exit(0);
}

if (!password) {
  console.error('[encrypt] 缺少 BLOG_PASSWORD。本地调试请设 SKIP_ENCRYPT=1。');
  process.exit(1);
}
if (!salt || !/^[0-9a-f]{32}$/i.test(salt)) {
  console.error('[encrypt] 缺少合法的 BLOG_SALT（32 位 hex，用 `openssl rand -hex 16` 生成）。');
  process.exit(1);
}

// 密码通过环境变量传，避免出现在进程列表和 CI 日志里；
// 老版本 staticrypt 不认这个变量，那就退回 -p。
const help = spawnSync(npx, ['--no-install', 'staticrypt', '--help'], {
  cwd: ROOT,
  encoding: 'utf8',
  shell: isWin,
});
const supportsEnvPassword = /STATICRYPT_PASSWORD/.test(help.stdout || '');

const args = [
  'staticrypt',
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

if (!supportsEnvPassword) args.push('-p', password);

console.log('[encrypt] 开始加密 dist/ …');
run(args);

const encRoot = path.join(ROOT, 'dist_enc');
const encDist = path.join(encRoot, 'dist');
if (!existsSync(encDist)) {
  console.error('[encrypt] 没找到 dist_enc/dist，staticrypt 的输出结构可能变了。');
  process.exit(1);
}

rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
renameSync(encDist, path.join(ROOT, 'dist'));
rmSync(encRoot, { recursive: true, force: true });

console.log('[encrypt] 完成 → dist/');
