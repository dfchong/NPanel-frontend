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

## SPA 路由与重定向

NPanel Admin 是单页应用（SPA），使用 TanStack Router 进行客户端路由。Cloudflare Pages 需要将所有页面请求指向 [`index.html`](../../apps/admin/index.html) 以支持前端路由。

[`_redirects`](../../apps/admin/public/_redirects) 文件已放置在 [`apps/admin/public/_redirects`](../../apps/admin/public/_redirects)，Vite 构建时会自动复制到输出目录。规则说明：

```bash
# 所有页面请求 → index.html（SPA 回退）
/* /index.html 200

# 静态资源 404 → 返回 404（避免错误回退）
/static/* /index.html 404
```

- **`/* /index.html 200`** — 所有未匹配的路由都返回 `index.html`，让前端路由接管
- **`/static/* /index.html 404`** — 如果 `/static/` 下的资源（JS/CSS chunk）找不到，返回 404 而不是回退到 SPA，避免浏览器把 HTML 当作 JS 模块加载导致白屏

> [!WARNING]
> 不要删除 [`_redirects`](../../apps/admin/public/_redirects) 文件。缺少该文件会导致刷新页面或直接访问子路径时返回 Cloudflare 404 页面。

---

## 自定义域名

1. 在 Cloudflare Pages 项目页面，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `admin.npanel.dev`）
4. Cloudflare 会自动添加 DNS 记录

> [!TIP]
> 如果你的域名 DNS 由 Cloudflare 托管，SSL 证书会自动配置（全程自动 HTTPS）。

---

## 常见问题

### 构建失败：`bun: command not found`

确保在 Cloudflare Pages 项目设置中配置了以下环境变量：

- `NODE_VERSION=20`
- `BUN_VERSION=1.3.1`

### 部署后页面白屏 / 控制台报 404

检查以下问题：

1. [`_redirects`](../../apps/admin/public/_redirects) 文件是否已部署（查看部署产物的文件列表）
2. `VITE_API_BASE_URL` 是否配置正确
3. 浏览器 Console 是否有跨域（CORS）错误

### API 请求 404 / CORS 错误

- 确认 `VITE_API_BASE_URL` 指向正确的后端地址
- 后端需要配置 CORS 允许 Cloudflare Pages 域名访问

### 刷新页面后 404

确认 [`_redirects`](../../apps/admin/public/_redirects) 文件存在且内容正确。部署后可以在 Cloudflare Pages 控制台的 **Redirect Rules** 中查看生效的规则。

---

## 参考资源

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Vite 部署到 Cloudflare Pages](https://vite.dev/guide/static-deploy.html#cloudflare-pages)
- [NPanel 前端分离部署指南](../separation/frontend.md)
