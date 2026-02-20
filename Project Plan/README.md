# Flux 灵动断食

Flux 是一款顺应身体节律、提供无压力断食体验的健康管理应用。

## 核心功能

- **弹性时钟**：呼吸光晕动效，支持开始、结束、暂停和完成状态。
- **状态管理**：自动计算断食时长，支持后台恢复和异常时间检测。
- **AI 餐盘分析** (Pro)：拍照识别食物热量与营养建议。
- **健康测评**：输入生命体征，生成多维度健康状态分析。
- **历史记录**：查看断食历史和统计数据。
- **灵活调整**：支持微调开始时间和补录历史记录。

## 技术栈

- **前端**：React, TypeScript, Tailwind CSS, Zustand (状态管理)
- **后端**：Express.js (API 服务)
- **开发工具**：Vite, Concurrently, Nodemon

## 快速开始

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```
   这将同时启动前端 (端口 5173) 和后端 (端口 3001)。

3. 打开浏览器访问 `http://localhost:5173`。

## 注意事项

- AI 分析功能目前使用模拟数据，实际部署时需配置 OpenAI API Key。
- 支付功能为模拟界面，需集成 RevenueCat SDK。
- 本地数据存储使用 `zustand/middleware/persist`，数据保存在 LocalStorage 中。
