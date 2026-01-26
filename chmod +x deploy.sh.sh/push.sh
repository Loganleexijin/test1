#!/bin/bash

# --- 自动化部署脚本 ---

# 1. 检查当前分支状态
echo "🚀 正在检查文件变动..."
git status

# 2. 添加所有变动到暂存区
git add .

# 3. 让用户输入提交信息（如果直接回车，则默认使用“Update fluxfasting”）
echo "📝 请输入本次更新的内容 (直接回车将使用默认备注):"
read commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update fluxfasting $(date +'%Y-%m-%d %H:%M')"
fi

# 4. 执行提交
git commit -m "$commit_msg"

# 5. 推送到远程 main 分支
echo "📤 正在同步到 GitHub，请稍候..."
git push origin main

echo "✅ 同步完成！Vercel 正在后台为你更新 fluxfasting.xyz ..."
echo "🌐 你可以前往 https://vercel.com/dashboard 查看进度。"