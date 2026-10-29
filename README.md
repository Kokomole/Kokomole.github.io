# 2014色彩漫游

用 GitHub Issue 当 CMS 的静态博客。写完 issue、打上 `published` 标签，GitHub Actions 自动构建、加密、发布到 Pages。

- 站点：https://kokomole.github.io
- 写文章：仓库 → Issues → New issue → 打 `published` 标签
- 使用手册：[怎么写博客.md](./怎么写博客.md)

## 本地这份代码不是必需品

日常写作完全在 GitHub 网页或手机 App 上完成，构建也在 GitHub 的服务器上跑。
本地代码只在**想改外观、加功能**时才需要。

## 目录

```
.github/workflows/
  deploy.yml         构建 → 加密 → 部署（Issues 或 push 触发）
  import-legacy.yml  一次性：把 legacy/*.md 建成 issue
scripts/
  sync-issues.mjs    GraphQL 拉 issue → 渲染 HTML → src/data/content.json
  lib/render.mjs     Markdown + KaTeX 渲染管线
  encrypt.mjs        StatiCrypt 加密 dist/
  migrate-legacy.mjs 旧站 HTML → Markdown
  import-legacy.mjs  批量建 issue
src/
  pages/             首页、文章页、独立页、404
  layouts/           BaseLayout
  styles/global.css  全部样式（含明暗两套 CSS 变量）
public/              robots.txt、favicon、图片
fixtures/           本地预览用的假数据
```

## 本地跑

```bash
npm ci
npm run dev          # 用 fixtures 数据启动，不需要 token
npm run build:local  # 用 fixtures 数据构建到 dist/
```

本地 `astro build` 若报 `safe-delete` 相关错误，说明环境里注入了删除钩子，用：

```bash
NODE_OPTIONS= node node_modules/astro/bin/astro.mjs build
```

## 部署所需的 GitHub Secrets

| Name | 说明 |
|---|---|
| `BLOG_PASSWORD` | 访问密码 |
| `BLOG_SALT` | 32 位 hex 固定盐（`openssl rand -hex 16`），改了会让所有读者重新输密码 |

## 技术要点

- 内容只在构建期通过 GraphQL 拉取，**页面端不调 GitHub API**（未认证限流 60 次/小时）。
- Markdown 在 `scripts/lib/render.mjs` 里自己渲染，与 Astro 的 Markdown 处理器版本解耦。
- 不生成 RSS / sitemap：它们会以明文泄露全文。
- 密码是「门帘」不是保险箱：issue 原文在 GitHub 上公开，图片与静态资源不加密。
