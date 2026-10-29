/**
 * 批量把 legacy/*.md 建成 GitHub Issue（一次性）。
 * 通常由 .github/workflows/import-legacy.yml 手动触发运行，使用 GITHUB_TOKEN，不需要 PAT。
 *
 * 幂等：按标题去重，重复运行不会产生重复 issue。
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY = path.join(ROOT, 'legacy');
const OWNER = process.env.REPO_OWNER || 'Kokomole';
const NAME = process.env.REPO_NAME || 'Kokomole.github.io';
const TOKEN = process.env.GITHUB_TOKEN || '';
const API = `https://api.github.com/repos/${OWNER}/${NAME}`;

if (!TOKEN) {
  console.error('缺少 GITHUB_TOKEN，请在 Actions 里运行本脚本。');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'kokomole-blog-import',
};

async function api(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, { ...init, headers });
  if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
  return res.json();
}

function firstHeading(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function deriveTitle(slug, md) {
  const meta = md.match(/^\s*<!--\s*meta\s*(\{[\s\S]*?\})\s*-->/);
  if (meta) {
    try {
      const parsed = JSON.parse(meta[1]);
      if (parsed.title) return String(parsed.title).trim();
    } catch {
      /* 忽略非法 meta */
    }
  }
  const h = firstHeading(md);
  if (h) return h;
  return slug === 'about' ? '关于' : slug;
}

async function existingTitles() {
  const titles = new Set();
  for (let page = 1; ; page += 1) {
    const list = await api(`/issues?state=all&per_page=100&page=${page}`);
    if (!list.length) break;
    for (const item of list) titles.add(item.title.trim());
    if (list.length < 100) break;
  }
  return titles;
}

async function main() {
  const files = readdirSync(LEGACY).filter((f) => f.endsWith('.md'));
  if (!files.length) {
    console.log('legacy/ 里没有 .md，先跑 `npm run migrate`。');
    return;
  }

  const titles = await existingTitles();
  let created = 0;
  let skipped = 0;

  for (const file of files.sort()) {
    const slug = path.basename(file, '.md');
    const md = readFileSync(path.join(LEGACY, file), 'utf8');
    const title = deriveTitle(slug, md);

    if (titles.has(title)) {
      skipped += 1;
      console.log(`跳过（已存在）：${title}`);
      continue;
    }

    const labels = slug === 'about' ? ['page'] : ['published'];
    await api('/issues', {
      method: 'POST',
      body: JSON.stringify({ title, body: md, labels }),
    });
    created += 1;
    console.log(`已创建：${title}`);
  }

  console.log(`\n完成：新建 ${created} 个，跳过 ${skipped} 个。`);
  console.log('提醒：用 GITHUB_TOKEN 创建的 issue 不会自动触发构建，请手动运行一次 "Build & Deploy"。');
}

main().catch((err) => {
  console.error('导入失败：', err.message);
  process.exit(1);
});
