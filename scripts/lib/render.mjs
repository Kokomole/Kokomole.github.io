import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import GithubSlugger from 'github-slugger';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);

/**
 * GitHub 粘贴图片时经常插入的是原生 HTML（<img width="600" src="…">），
 * 所以必须允许裸 HTML 通过，否则图片会被整块丢掉。
 * 这里只放行，随后再做一次轻量清洗，挡掉脚本类标签和事件属性。
 */
const BAD_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'style',
  'link',
  'meta',
  'form',
  'input',
  'button',
  'base',
]);

function rehypeSanitizeLight() {
  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.filter(
        (child) => !(child.type === 'element' && BAD_TAGS.has(child.tagName))
      );
      for (const child of node.children) {
        if (child.type === 'element' && child.properties) {
          for (const key of Object.keys(child.properties)) {
            if (/^on/i.test(key)) delete child.properties[key];
            const value = child.properties[key];
            if ((key === 'href' || key === 'src') && /^\s*javascript:/i.test(String(value))) {
              delete child.properties[key];
            }
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitizeLight)
  .use(rehypeSlug)
  .use(rehypeKatex, { throwOnError: false, strict: false, output: 'html' })
  .use(rehypeStringify);


function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
  if (node.type === 'image') return node.alt || '';
  if (node.type === 'math' || node.type === 'inlineMath') return node.value || '';
  if (!node.children) return '';
  return node.children.map(nodeText).join('');
}

function collectHeadings(tree) {
  const slugger = new GithubSlugger();
  const out = [];
  const walk = (node) => {
    if (node.type === 'heading' && node.depth >= 2 && node.depth <= 3) {
      const text = nodeText(node).trim();
      if (text) out.push({ depth: node.depth, text, id: slugger.slug(text) });
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(tree);
  return out;
}

/**
 * Markdown -> { html, toc }
 * 公式渲染失败时只会变成红色报错文本（throwOnError: false），不会让整站构建中断。
 */
export async function renderMarkdown(md) {
  const html = String(await processor.process(md ?? ''));
  let toc = [];
  try {
    toc = collectHeadings(parser.parse(md ?? ''));
  } catch {
    toc = [];
  }
  return { html, toc };
}

/** 粗略提取纯文本，用来生成列表页摘要 */
export function plainText(md, limit = 90) {
  const text = String(md ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
