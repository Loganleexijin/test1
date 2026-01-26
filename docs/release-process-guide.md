# 上线流程指南 (Deployment Guide)

**文档版本**: 1.0  
**最后更新**: 2026-01-24  
**项目名称**: 断食 APP (Flux Fasting)  
**适用范围**: 前端 (Vercel) + 后端/数据库 (Supabase)

---

## 1. 项目概述与上线目标

### 1.1 项目简介
本项目是一个基于 React + Vite 的断食追踪应用，集成了 Supabase (PostgreSQL, Auth) 作为后端服务，并托管在 Vercel 平台上。

### 1.2 上线目标
-   **高可用性**: 确保全球用户能快速访问 (`fluxfasting.xyz`)。
-   **自动化部署**: 代码推送到 GitHub 主分支后自动触发构建和发布。
-   **数据安全**: 确保数据库连接安全，环境变量配置正确。
-   **功能完整**: 确保 Google OAuth 登录、AI 接口、支付逻辑在生产环境正常运行。

---

## 2. 环境配置要求

本项目分为开发环境 (Development) 和生产环境 (Production)。

### 2.1 开发环境 (Local)
-   **依赖**: Node.js v18+, npm
-   **配置文件**: `.env.local` (不提交到 Git)
    ```ini
    VITE_APP_NAME=断食APP
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    DOUBAO_API_KEY=your-doubao-key
    VITE_SITE_URL=http://localhost:5173
    ```

### 2.2 生产环境 (Production)
-   **平台**: Vercel Serverless
-   **配置文件**: Vercel Dashboard -> Settings -> Environment Variables
    | 变量名 | 说明 | 示例值 |
    | :--- | :--- | :--- |
    | `VITE_APP_NAME` | 应用名称 | `断食APP` |
    | `VITE_SUPABASE_URL` | Supabase 项目地址 | `https://lsrkjybvrrdlitwrxhpr.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | Supabase 公开密钥 | `sb_publishable_...` |
    | `DOUBAO_API_KEY` | AI 服务密钥 | `aa75539a-...` |
    | `VITE_SITE_URL` | 生产环境域名 | `https://fluxfasting.xyz` |

---

## 3. 代码准备与分支管理

### 3.1 分支策略
-   **`main`**: 生产分支 (Production)。推送到此分支会**立即触发** Vercel 的生产环境部署。
-   **`dev` / `feature/*`**: 开发分支。建议在合并到 `main` 之前先在 Preview 环境测试。

### 3.2 代码准备 Checklist
-   [ ] 确认所有本地 `.env.local` 中的关键配置已同步到 Vercel 环境变量。
-   [ ] 检查 `console.log` 是否包含敏感信息。
-   [ ] 运行 `npm run build` 确保本地构建无报错。
-   [ ] 确认 `supabase_schema.sql` 中的数据库变更已在 Supabase 执行。

---

## 4. 构建与打包步骤

本项目采用 Vercel 托管，构建过程完全自动化。

### 4.1 自动构建流程
1.  开发者 Push 代码到 GitHub `main` 分支。
2.  Vercel 检测到 Commit，启动构建容器。
3.  **Install**: 执行 `npm install`。
4.  **Build**: 执行 `npm run build` (Vite Build)。
5.  **Output**: 生成 `dist/` 静态文件和 API Serverless Functions。

### 4.2 本地构建测试 (可选)
如果需要排查构建错误：
```bash
# 清理缓存
rm -rf node_modules/.vite
# 执行构建
npm run build
# 预览构建结果
npm run preview
```

---

## 5. 部署操作 (详细步骤)

### 5.1 首次部署 (One-time Setup)
1.  **Vercel 关联**: 在 Vercel Dashboard 点击 "Add New Project"，导入 GitHub 仓库 `test1`。
2.  **配置变量**: 填入 2.2 节中的所有环境变量。
3.  **域名绑定**: Settings -> Domains -> 添加 `fluxfasting.xyz` -> 按提示配置 DNS (A记录/CNAME)。

### 5.2 日常部署 (Routine Deployment)
只需执行 Git 命令：
```bash
# 1. 添加更改
git add .
# 2. 提交代码 (附带清晰的 Commit Message)
git commit -m "feat: add google login support"
# 3. 推送到远程 main 分支 -> 触发部署
git push origin main
```

### 5.3 部署状态确认
-   访问 Vercel Dashboard，查看最新的 Deployment 状态。
-   **Building** (蓝色): 正在构建。
-   **Ready** (绿色): 部署成功，已上线。
-   **Error** (红色): 构建失败，需查看 Logs 排查。

---

## 6. 数据库与后端配置

### 6.1 数据库迁移 (Supabase)
由于目前未引入 Prisma 等 ORM 迁移工具，数据库变更需手动执行 SQL：
1.  登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2.  进入 **SQL Editor**。
3.  粘贴 `supabase_schema.sql` 或新的变更语句。
4.  点击 **Run** 执行。

### 6.2 Auth 配置更新 (Google OAuth)
上线前必须确认 OAuth 回调地址：
1.  **Google Cloud Console**:
    -   Credentials -> Authorized redirect URIs -> 确保包含 `https://<PROJECT_ID>.supabase.co/auth/v1/callback`
2.  **Supabase Auth**:
    -   URL Configuration -> Site URL -> `https://fluxfasting.xyz`
    -   Redirect URLs -> 添加 `https://fluxfasting.xyz/**`

---

## 7. 监控与日志

### 7.1 运行时日志
-   **前端/API 报错**: Vercel Dashboard -> Deployments -> 点击具体部署 -> **Logs** 选项卡。
-   **数据库报错**: Supabase Dashboard -> **Logs** -> **Postgres Logs** / **API Logs**。

### 7.2 关键监控指标
-   **Vercel Analytics**: 查看 PV/UV、页面加载速度 (Web Vitals)。
-   **Supabase Database Health**: 查看 CPU、RAM、Disk IO 使用率。

---

## 8. 回滚方案与应急预案

### 8.1 快速回滚 (Instant Rollback)
如果上线后发现严重 Bug，无需回退代码，直接切换流量：
1.  打开 Vercel Dashboard -> Deployments。
2.  找到上一个**成功**的版本 (Ready 状态)。
3.  点击右侧三个点 `...` -> **Promote to Production** (或 Instant Rollback)。
4.  耗时：约 10-30 秒。

### 8.2 数据库回滚
-   **预防**: 每次执行破坏性 SQL (DROP, DELETE) 前，先在 Supabase Database -> Backups 进行手动备份。
-   **恢复**: 如果数据损坏，使用 Supabase 的 Point-in-Time Recovery (PITR) 恢复到指定时间点。

---

## 9. 上线后验证 (Smoke Test)

部署完成后，由 QA 或开发人员执行以下验证：

| 验证项 | 操作步骤 | 预期结果 |
| :--- | :--- | :--- |
| **站点访问** | 浏览器访问 `https://fluxfasting.xyz` | 页面加载正常，无 404/500 错误 |
| **Google 登录** | 点击“Google 账号登录” | 跳转 Google 授权页，授权后跳回并显示已登录态 |
| **数据读取** | 进入“个人中心” | 能正确显示用户昵称、ID (从 Supabase 读取) |
| **AI 接口** | 使用“AI 餐食分析”功能 | 能成功上传图片并返回分析结果 |
| **SSL 证书** | 检查浏览器地址栏 | 显示安全锁图标 (HTTPS 正常) |

---

## 附录：常用命令速查

```bash
# 启动本地开发服务
npm run dev

# 检查本地构建
npm run build

# 强制推送到远程 (慎用)
git push -f origin main

# 查看 Git 远程仓库地址
git remote -v
```
