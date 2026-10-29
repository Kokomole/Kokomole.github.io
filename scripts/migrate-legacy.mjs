/**
 * 一次性迁移：把旧 Gridea 站（纯 HTML，没有 Markdown 源码）的 16 篇文章
 * 反解成 Markdown，输出到 legacy/<slug>.md，供 import-legacy.yml 批量建 issue。
 *
 * 用法：npm run migrate
 *
 * 结构依据（已对 kokomole.github.io 实测）：
 *   正文  #post_body
 *   标题  h1.post-title          （含 " | 2014色彩漫游" 后缀）
 *   日期  .publish-time[data-t]  （2020-08-01 01:31:36）
 *   标签  .tags a
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, cpSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '.cache', 'legacy-src');
const OUT = path.join(ROOT, 'legacy');
const REPO = 'Kokomole/Kokomole.github.io';
const BRANCH = 'master';
const SITE_SUFFIX = /\s*\|\s*2014色彩漫游\s*$/;

/* ---------- 1. 取旧站源码 ---------- */

async function ensureSource() {
  if (existsSync(path.join(SRC, 'post'))) {
    console.log('[migrate] 复用已有旧站源码 .cache/legacy-src');
    return;
  }
  mkdirSync(SRC, { recursive: true });
  const tgz = path.join(ROOT, '.cache', 'legacy.tar.gz');
  const url = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}`;
  console.log(`[migrate] 下载 ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status}`);
  writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
  mkdirSync(path.dirname(tgz), { recursive: true });
  execFileSync('tar', ['-xzf', tgz, '-C', SRC, '--strip-components=1']);
  rmSync(tgz, { force: true });
  console.log('[migrate] 解压完成');
}

/* ---------- 2. 解析 ---------- */

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
    hr: '---',
  });
  td.use(gfm);

  // 代码块保留语言
  td.addRule('fencedCode', {
    filter: (node) => node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
    replacement: (_content, node) => {
      const code = node.firstChild;
      const cls = [...(code.getAttribute('class') || '').split(/\s+/)];
      const lang = cls.find((c) => c.startsWith('language-'))?.slice(9) || '';
      const text = code.textContent.replace(/\n$/, '');
      return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
    },
  });

  // 有些 <pre> 里没有 <code>，不兜住会退化成缩进代码块，内容里的 # 行会被误判成标题
  td.addRule('preOnly', {
    filter: (node) => node.nodeName === 'PRE' && node.firstChild?.nodeName !== 'CODE',
    replacement: (_content, node) => {
      const text = node.textContent.replace(/\n$/, '');
      return `\n\n\`\`\`\n${text}\n\`\`\`\n\n`;
    },
  });

  // 图片：保留原始地址，统一成绝对地址，方便在 issue 里直接看到
  td.addRule('absImage', {
    filter: 'img',
    replacement: (_c, node) => {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      if (!src) return '';
      const abs = src.startsWith('http') ? src : `https://kokomole.github.io/${src.replace(/^\/+/, '')}`;
      return `![${alt}](${abs})`;
    },
  });

  td.remove(['script', 'style', 'noscript', '.post-copyright', '.reward', '.toc-wrapper']);
  return td;
}

function tidy(md) {
  return md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\n\s*\n(\s*```)/g, '\n\n$1');
}

/** 逐行处理，但跳过代码围栏内部 */
function eachLineOutsideFences(md, fn) {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : fn(line);
    })
    .join('\n');
}

function normalize(md) {
  return eachLineOutsideFences(md, (line) => {
    // turndown 会把「1. xxx」转义成「1\. xxx」
    let out = line.replace(/(\d)\\\./g, '$1.');
    // 正文里的 # 是分节标题，页面本身已有 h1，所以整体降一级
    const h = out.match(/^(#{1,5})(\s+)(.*)$/);
    if (h) out = `#${h[1]} ${h[3]}`;
    return out;
  });
}

function extract(dir) {
  const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
  const { document } = parseHTML(html);

  const bodyEl = document.querySelector('#post_body');
  if (!bodyEl) return null;

  const rawTitle =
    document.querySelector('h1.post-title')?.textContent?.trim() ||
    document.querySelector('title')?.textContent?.split('|')[0]?.trim() ||
    '';
  const title = rawTitle.replace(SITE_SUFFIX, '').trim();

  const timeEl = document.querySelector('.publish-time');
  const date = timeEl?.getAttribute('data-t') || timeEl?.textContent?.trim() || '';
  const dateShort = (date.match(/\d{4}-\d{2}-\d{2}/) || [''])[0];

  const tags = [...document.querySelectorAll('.tags a')]
    .map((a) => a.textContent.trim().replace(/^#\s*/, ''))
    .filter(Boolean);

  const md = normalize(tidy(makeTurndown().turndown(bodyEl.innerHTML)));
  return { title, date: dateShort, tags, md };
}

/* ---------- 3. 主流程 ---------- */

async function main() {
  await ensureSource();
  mkdirSync(OUT, { recursive: true });
  const td = makeTurndown();
  void td;

  const postRoot = path.join(SRC, 'post');
  const dirs = readdirSync(postRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let count = 0;
  for (const slug of dirs) {
    const dir = path.join(postRoot, slug);
    if (!existsSync(path.join(dir, 'index.html'))) {
      console.warn(`[migrate] 跳过 ${slug}（没有 index.html）`);
      continue;
    }
    const got = extract(dir);
    if (!got || !got.md) {
      console.warn(`[migrate] 跳过 ${slug}（没找到 #post_body）`);
      continue;
    }

    const isPage = slug === 'about';
    const meta = {
      date: got.date || undefined,
      slug,
      title: got.title,
      tags: got.tags.length ? got.tags : undefined,
    };
    const front = `<!-- meta ${JSON.stringify(meta)} -->\n\n`;

    writeFileSync(path.join(OUT, `${slug}.md`), front + got.md + '\n', 'utf8');
    count += 1;
    console.log(
      `[migrate] ${isPage ? '页面' : '文章'} ${slug} · ${got.date || '无日期'} · ${got.title} · ${got.md.length} 字符`
    );
  }

  // 旧图片原样搬进 public/，这样旧文里的绝对地址切换后依然有效
  for (const dirName of ['post-images', 'images']) {
    const from = path.join(SRC, dirName);
    const to = path.join(ROOT, 'public', dirName);
    if (existsSync(from) && !existsSync(to)) {
      cpSync(from, to, { recursive: true });
      console.log(`[migrate] 已复制 ${dirName}/ → public/${dirName}/`);
    } else if (existsSync(to)) {
      console.log(`[migrate] ${dirName}/ 已存在，跳过复制`);
    }
  }

  console.log(`\n[migrate] 完成，共 ${count} 个文件 → legacy/`);
  console.log('[migrate] 下一步：检查 legacy/ 里的内容，然后到 Actions 手动运行 "Import legacy posts"。');
}

main().catch((err) => {
  console.error('[migrate] 失败：', err);
  process.exit(1);
});
