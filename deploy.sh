#!/bin/bash

# 打印欢迎信息
echo "🚀 启动部署流程..."

# 1. 询问部署目标
echo ""
echo "请选择部署目标环境："
echo "  [1] 🟡 测试环境 (Test Environment -> branch: test)"
echo "  [2] 🟢 正式环境 (Production Environment -> branch: main)"
read -p "请输入选项 (1 或 2): " target_option

if [[ "$target_option" == "1" ]]; then
    TARGET_BRANCH="test"
    ENV_NAME="Preview (测试环境)"
elif [[ "$target_option" == "2" ]]; then
    TARGET_BRANCH="main"
    ENV_NAME="Production (正式环境)"
else
    echo "❌ 无效选项，退出。"
    exit 1
fi

# 2. 提交代码
echo ""
echo "📦 准备提交代码..."
read -p "请输入提交信息 (直接回车将使用当前时间戳): " commit_msg

if [[ -z "$commit_msg" ]]; then
    commit_msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 检查是否有文件需要提交
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "$commit_msg"
else
    echo "⚠️  当前没有文件更改需要提交，将直接尝试推送..."
fi

# 3. 推送代码
echo ""
echo "🚀 正在推送到远程 $TARGET_BRANCH 分支..."

# 将当前分支(HEAD)推送到远程的目标分支
# 如果远程分支不存在，会自动创建
git push origin HEAD:$TARGET_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 操作成功！"
    echo "Vercel 将检测到 $TARGET_BRANCH 分支的更新，并自动开始构建 $ENV_NAME。"
    echo "提示：请确保 Vercel 项目设置中已连接该 Git 仓库，且 Production Branch 设置为 main。"
else
    echo ""
    echo "❌ 推送失败，请检查网络或 git 状态。"
    exit 1
fi
