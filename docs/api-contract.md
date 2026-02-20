# API 契约与部署注意事项

## 统一响应格式
所有 `/api/*` 接口统一返回以下 JSON 之一：

### 成功
```json
{
  "success": true,
  "data": {},
  "message": "可选"
}
```

### 失败
```json
{
  "success": false,
  "message": "错误信息",
  "errorCode": "可选"
}
```

## 鉴权
- Bearer Token：`Authorization: Bearer <access_token>`
- 前端会把 `localStorage.authToken` 自动注入到所有请求头（如存在）。
- 部分接口在“未登录”时会回退到本地文件 DB（仅用于开发/演示）；登录后会落库到 Supabase。

## Auth
- `POST /api/auth/register`：`{ email, password }` → `{ user, session }`
- `POST /api/auth/login`：`{ email, password }` → `{ user, session }`
- `POST /api/auth/logout`：无 body → `data: null`
- `GET /api/auth/me`：需要 Bearer Token → `{ user }`

## 断食（Fasting）
- `GET /api/fasting/current`：获取当前未完成 session 或 `null`
- `GET /api/fasting/history`：获取历史已完成 sessions
- `POST /api/fasting/start`：`{ targetHours, startTime, plan }` → 新 session
- `POST /api/fasting/end`：结束当前 session
- `POST /api/fasting/cancel`：取消当前 session
- `GET /api/fasting/plan` / `POST /api/fasting/plan`：读取/设置计划（需要 `user_profiles.plan` 字段）

## 餐食（Meals）
- `GET /api/meals/today`：获取今日餐食列表
- `GET /api/meals?from=<ms>&to=<ms>`：按时间范围查询
- `POST /api/meals`：创建餐食
- `PATCH /api/meals/:id`：更新餐食
- `DELETE /api/meals/:id`：删除餐食

统一字段（前端使用 camelCase）：
- `id`, `timestamp`, `type`, `imageUrl`, `foodName`, `calories`, `aiAnalysis`

## AI
- `POST /api/ai/analyze`：`{ image, currentState }` → 单餐分析 JSON（已包装为统一响应）  
  - `image` 建议传可访问 URL（通过 `/api/files/upload` 上传后得到）
- `POST /api/ai/analyze-day`：`{ meals: [{ type, foodName, calories }] }` → 今日综合分析 JSON（已包装）

## 文件（Files）
- `POST /api/files/upload`：`{ dataUrl }` → `{ url, bucket, path, ... }`
  - 需要登录态（Bearer Token）
  - `dataUrl` 形如 `data:image/jpeg;base64,...`
  - `url` 为短期可用的签名链接；持久化请保存 `path`
- `GET /api/files/signed-url?bucket=...&path=...&expiresIn=60`：生成签名下载链接（需要登录态）

## 环境变量与部署
### 必需
- `DOUBAO_API_KEY`：后端 AI 分析密钥
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`：前端 Supabase（同时也可被后端复用）

### 推荐（后端）
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`：显式配置后端
- `SUPABASE_SERVICE_ROLE_KEY`：推荐配置，用于 Storage 上传/签名与服务端写入（避免受匿名策略影响）

### Serverless 注意事项（Vercel）
- 不要依赖本地文件持久化：Vercel serverless 的磁盘写入不保证持久与一致性。
- 本项目在登录态下会写入 Supabase；未登录时的文件 DB 仅用于开发/演示。
