
import { createClient } from '@supabase/supabase-js';

// 读取环境变量
// 优先使用 Vite 的 import.meta.env (前端)，如果是在 Node 环境则尝试 process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase 环境变量未设置。请确保 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 已配置。'
  );
}

// 创建 Supabase 客户端
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
