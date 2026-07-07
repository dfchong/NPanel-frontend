# 部署 NPanel Admin 到 Cloudflare Pages

本文档指导如何将 NPanel 管理后台（[`NPanel-admin-web`](../../apps/admin)）通过 **Git 集成** 方式部署到 Cloudflare Pages。

---

## 前置要求

1. **Cloudflare 账号** — 注册 [Cloudflare](https://dash.cloudflare.com/sign-up)
2. **GitHub/GitLab/Gitee 仓库** — 托管 NPanel 前端代码

---

## 步骤 1：创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Pages**
3. 点击 **Connect to Git**
4. 授权并选择你的 NPanel-frontend 仓库

---

## 步骤 2：配置构建设置

在 **Set up builds and deployments** 页面配置：

| 配置项 | 值 |
|--------|-----|
| **Project name** | `npanel-admin`（可自定义） |
| **Production branch** | `main`（或你的主分支） |
| **Build command** | `bun install && bun run build --filter=NPanel-admin-web` |
| **Build output directory** | `apps/admin/dist` |
| **Root directory** | （留空，使用仓库根目录） |

---

## 步骤 3：配置环境变量

在 **Environment variables (advanced)** 中添加：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| [`VITE_API_BASE_URL`](../../apps/admin/.env.example#L2) | 后端 API 地址 | `https://api.npanel.dev` |
| [`VITE_API_PREFIX`](../../apps/admin/.env.example#L4) | API 路径前缀（可选） | `/api` |
| [`VITE_CDN_URL`](../../apps/admin/.env.example#L7) | CDN 域名 | `https://cdn.jsdmirror.com` |
| [`VITE_TUTORIAL_DOCUMENT`](../../apps/admin/.env.example#L10) | 启用教程文档 | `true` |
| `NODE_VERSION` | Node.js 版本 | `20` |
| `BUN_VERSION` | Bun 版本 | `1.3.1` |

> [!IMPORTANT]
> Cloudflare Pages 默认环境不含 Bun，必须设置 `NODE_VERSION=20` 和 `BUN_VERSION=1.3.1`，Cloudflare Pages 会通过 `BUN_VERSION` 自动安装对应版本的 Bun。

---

## 步骤 4：保存并部署

点击 **Save and Deploy**。Cloudflare Pages 会自动：

1. 检测到新提交时触发构建
2. 安装 Bun 和依赖
3. 执行 `bun run build --filter=NPanel-admin-web`
4. 将 `apps/admin/dist` 部署到 Pages

首次部署完成后，你会获得一个 `<project-name>.pages.dev` 域名。

---

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| [`VITE_API_BASE_URL`](../../apps/admin/.env.example#L2) | 是 | 后端 API 的基础 URL。生产环境应设置为实际的部署地址 |
| [`VITE_API_PREFIX`](../../apps/admin/.env.example#L4) | 否 | API 路径前缀，默认为空 |
| [`VITE_CDN_URL`](../../apps/admin/.env.example#L7) | 否 | 静态资源 CDN 地址，用于加载 Monaco Editor 等依赖 |
| [`VITE_TUTORIAL_DOCUMENT`](../../apps/admin/.env.example#L10) | 否 | 是否显示教程文档入口，`true` / `false` |

> [!NOTE]
> 环境变量在构建时通过 Vite 注入到 `import.meta.env`。如果部署后发现 API 请求地址不对，请检查 `VITE_API_BASE_URL` 是否正确配置。

---

## 构建问题排查

### Rollup 无法解析 react/jsx-runtime

**问题**：Cloudflare Pages 构建环境中，Bun 的包存储机制（`node_modules/.bun/` 目录）与 Rollup 的模块解析不兼容，导致构建时报错 `Rollup failed to resolve import "react/jsx-runtime"`。

**解决方案（三选一）：**

**方案 A：使用 Netlify 部署（推荐）**

项目已内置 [`netlify.toml`](../../netlify.toml) 配置，Netlify 对 Bun + Vite 的兼容性更好。

1. 登录 [Netlify](https://app.netlify.com)
2. **Add new site** → **Import an existing project**
3. 选择仓库，Netlify 会自动读取 [`netlify.toml`](../../netlify.toml) 配置
4. 在环境变量中添加 `VITE_API_BASE_URL`（后端地址）
5. 部署即可

**方案 B：使用 GitHub Actions + Wrangler 部署**

通过 GitHub Actions 构建，再用 Wrangler CLI 上传到 Cloudflare Pages，绕过 Cloudflare Pages 构建环境与 Bun 的兼容性问题。

在仓库根目录创建 `.github/workflows/deploy-admin.yml`：

```yaml
name: Deploy Admin to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - "NPanel-frontend/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.1

      - run: |
          cd NPanel-frontend
          bun install
          bun run build --filter=NPanel-admin-web
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy NPanel-frontend/apps/admin/dist --project-name npanel-admin
```

**方案 C：本地构建后手动上传**

```bash
cd NPanel-frontend
bun install
VITE_API_BASE_URL=https://your-api.com bun run build --filter=NPanel-admin-web
npx wrangler pages deploy apps/admin/dist --project-name npanel-admin
```

---

## SPA 路由与重定向

NPanel Admin 是单页应用（SPA），使用 TanStack Router 进行客户端路由。[`_redirects`](../../apps/admin/public/_redirects) 文件已放置在 [`apps/admin/public/_redirects`](../../apps/admin/public/_redirects)：

```bash
# 所有页面请求 → index.html（SPA 回退）
/* /index.html 200

# 静态资源 404 → 返回 404（避免错误回退）
/static/* /index.html 404
```

---

## 自定义域名

1. 在 Cloudflare Pages 项目页面，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `admin.npanel.dev`）
4. Cloudflare 会自动添加 DNS 记录
