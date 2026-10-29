/**
 * 把仓库里的 GitHub Issue 同步成站点内容。
 *
 * 为什么必须在构建期跑、而不是在浏览器里跑：
 * 未认证的 GitHub API 限流是 60 次/小时/IP，几个人一刷站点就白屏。
 * 这里用 token 在 Actions 里拉取，把内容「烤」进静态文件。
 *
 * 用法：
 *   GITHUB_TOKEN=xxx node scripts/sync-issues.mjs      # 真实数据
 *   node scripts/sync-issues.mjs --fixtures            # 本地假数据（无需 token）
 */
import { readFile, readdir, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown, plainText } from './lib/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const OWNER = process.env.REPO_OWNER || 'Kokomole';
const NAME = process.env.REPO_NAME || 'Kokomole.github.io';
const TOKEN = process.env.GITHUB_TOKEN || '';
const USE_FIXTURES = process.argv.includes('--fixtures');
const USE_LEGACY = process.argv.includes('--legacy');

const RESERVED_LABELS = new Set(['published', 'draft', 'pinned', 'page']);

const SITE = {
  title: '2014色彩漫游',
  description: '祝你生活愉快~',
  author: 'Kokomole',
  nav: [
    { href: '/', label: '首页' },
    { href: '/about/', label: '关于' },
  ],
};

/* ------------------------------------------------------------------ */
/* 拉取                                                                */
/* ------------------------------------------------------------------ */

const QUERY = `
query ($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    issues(first: 50, after: $cursor, states: [OPEN, CLOSED],
           orderBy: { field: CREATED_AT, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title body createdAt updatedAt
        labels(first: 30) { nodes { name } }
      }
    }
  }
}`;

async function fetchIssues() {
  if (!TOKEN) {
    throw new Error(
      '缺少 GITHUB_TOKEN。本地预览请用 `npm run dev`（自动走 fixtures），CI 里由 Actions 注入 token。'
    );
  }
  const all = [];
  let cursor = null;
  for (;;) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'kokomole-blog-build',
      },
      body: JSON.stringify({ query: QUERY, variables: { owner: OWNER, name: NAME, cursor } }),
    });
    if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    const conn = json.data.repository.issues;
    for (const n of conn.nodes) {
      all.push({
        number: n.number,
        title: n.title,
        body: n.body || '',
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        labels: (n.labels?.nodes || []).map((l) => l.name),
      });
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return all;
}

async function loadFixtures() {
  const raw = await readFile(path.join(ROOT, 'fixtures', 'issues.json'), 'utf8');
  return JSON.parse(raw);
}

/** 预览模式：直接读 legacy/*.md（还没建成 issue 之前先看效果） */
async function loadLegacy() {
  const dir = path.join(ROOT, 'legacy');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const out = [];
  for (const [i, file] of files.entries()) {
    const slug = path.basename(file, '.md');
    const body = await readFile(path.join(dir, file), 'utf8');
    out.push({
      number: 9000 + i,
      title: slug,
      body,
      createdAt: '2020-01-01T00:00:00Z',
      labels: slug === 'about' ? ['page'] : ['published'],
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 解析                                                                */
/* ------------------------------------------------------------------ */

const META_RE = /^\s*<!--\s*meta\s*(\{[\s\S]*?\})\s*-->\s*/;

function parseMeta(body) {
  const m = body.match(META_RE);
  if (!m) return { meta: {}, body };
  let meta = {};
  try {
    meta = JSON.parse(m[1]);
  } catch {
    console.warn('[sync] meta 注释不是合法 JSON，已忽略：', m[1]);
  }
  return { meta, body: body.slice(m[0].length) };
}

function asciiSlug(title) {
  return title
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function pickSlug(meta, title, number, used) {
  let slug = meta.slug || asciiSlug(title) || `n${number}`;
  slug = String(slug).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || `n${number}`;
  if (used.has(slug)) slug = `${slug}-${number}`;
  used.add(slug);
  return slug;
}

/** 从 "2020-08-01 01:31" 或 ISO 字符串里取年月日，避免时区把日期挪一天 */
function parseDateParts(value) {
  const m = String(value ?? '').match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) {
    const d = new Date();
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      iso: d.toISOString(),
    };
  }
  const [, y, mo, d, hh = '00', mm = '00'] = m;
  return {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    iso: new Date(`${y}-${mo}-${d}T${hh}:${mm}:00Z`).toISOString(),
  };
}

/** 只处理代码围栏之外的文本，避免把示例代码里的 #123 也改掉 */
function mapOutsideFences(md, fn) {
  return md
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((chunk, i) => (i % 2 === 1 ? chunk : fn(chunk)))
    .join('');
}

function rewriteLinks(body, numberToSlug) {
  const issueUrl = new RegExp(
    `https?://github\\.com/${OWNER}/${NAME.replace(/\./g, '\\.')}/issues/(\\d+)`,
    'g'
  );
  return mapOutsideFences(body, (chunk) =>
    chunk
      .replace(/(?<![[\w/#])#(\d+)(?![\d\]])/g, (full, n) =>
        numberToSlug.has(Number(n)) ? `[#${n}](/post/${numberToSlug.get(Number(n))}/)` : full
      )
      .replace(issueUrl, (full, n) =>
        numberToSlug.has(Number(n)) ? `/post/${numberToSlug.get(Number(n))}/` : full
      )
  );
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  let issues;
  if (USE_LEGACY) issues = await loadLegacy();
  else if (USE_FIXTURES) issues = await loadFixtures();
  else issues = await fetchIssues();
  console.log(
    `[sync] 拉到 ${issues.length} 个 issue${USE_FIXTURES ? '（fixtures）' : USE_LEGACY ? '（legacy 预览）' : ''}`
  );

  const parsed = issues.map((issue) => {
    const labels = issue.labels || [];
    const { meta, body } = parseMeta(issue.body || '');
    return { ...issue, labels, meta, body, tagLabels: labels.filter((l) => !RESERVED_LABELS.has(l)) };
  });

  const isPage = (p) => p.labels.includes('page');
  const isPublished = (p) =>
    (p.labels.includes('published') || isPage(p)) && !p.labels.includes('draft');
  const live = parsed.filter(isPublished);

  // 第一轮：定 slug，才能改写互链
  const usedSlugs = new Set();
  const numberToSlug = new Map();
  const slugs = new Map();
  for (const p of live.slice().sort((a, b) => a.number - b.number)) {
    const preferred = { ...p.meta };
    // 「关于」页固定用 /about/，否则导航会指向一个不存在的地址
    if (isPage(p) && !preferred.slug && /^(关于|about)$/i.test(p.title.trim())) {
      preferred.slug = 'about';
    }
    const slug = pickSlug(preferred, p.title, p.number, usedSlugs);
    slugs.set(p.number, slug);
    if (!isPage(p)) numberToSlug.set(p.number, slug);
  }

  const posts = [];
  const pages = [];

  for (const p of live) {
    const slug = slugs.get(p.number);
    const dateSource = p.meta.date || p.createdAt;
    const { year, month, day, iso } = parseDateParts(dateSource);
    const body = rewriteLinks(p.body, numberToSlug);
    const { html, toc } = await renderMarkdown(body);
    const base = {
      number: p.number,
      slug,
      title: (p.meta.title || p.title).trim(),
      date: iso,
      year,
      month,
      day,
      tags: Array.isArray(p.meta.tags) && p.meta.tags.length ? p.meta.tags : p.tagLabels,
      html,
      toc,
      excerpt: plainText(body),
      sourceUrl: `https://github.com/${OWNER}/${NAME}/issues/${p.number}`,
    };

    if (isPage(p)) {
      pages.push(base);
    } else {
      posts.push({ ...base, pinned: Boolean(p.meta.pinned) || p.labels.includes('pinned') });
    }
  }

  posts.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });
  pages.sort((a, b) => a.slug.localeCompare(b.slug));

  const out = { generatedAt: new Date().toISOString(), site: SITE, posts, pages };
  const dest = path.join(ROOT, 'src', 'data', 'content.json');
  await mkdir(path.dirname(dest), { recursive: true });
  await writeJsonFresh(dest, out);

  console.log(`[sync] 文章 ${posts.length} 篇 / 独立页 ${pages.length} 个 → src/data/content.json`);
}

/**
 * 某些环境（沙箱 / 杀毒软件 / 只读快照）不允许覆盖已存在的文件，
 * 遇到 EPERM 就先把旧文件挪成 .bak 再写，避免整个构建被卡死。
 */
async function writeJsonFresh(dest, data) {
  const text = JSON.stringify(data, null, 2);
  try {
    await writeFile(dest, text, 'utf8');
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EACCES') throw err;
    try {
      await rename(dest, `${dest}.bak`);
    } catch {
      /* 挪不动就直接再试一次，失败就把原始错误抛出去 */
    }
    await writeFile(dest, text, 'utf8');
  }
}

main().catch((err) => {
  console.error('[sync] 失败：', err.message);
  process.exit(1);
});
