import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Phone, Lock } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';

const toHex = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password: string, salt: string) => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

export default function Login() {
  const navigate = useNavigate();
  const { authToken, userProfile, passwordHash, passwordSalt, setAuthToken, updateUserProfile } = useFastingStore();
  const [phone, setPhone] = useState(userProfile.phone ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useMemo(() => Boolean(authToken), [authToken]);

  const handleLogin = async () => {
    setError('');
    const normalizedPhone = phone.trim();
    if (!/^1\d{10}$/.test(normalizedPhone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!passwordHash || !passwordSalt) {
      setError('请先在个人中心设置登录密码');
      return;
    }
    setIsLoading(true);
    try {
      const digest = await hashPassword(password, passwordSalt);
      if (digest !== passwordHash) {
        setError('手机号或密码错误');
        return;
      }
      updateUserProfile({ phone: normalizedPhone, phoneVerified: true });
      setAuthToken(`token_${crypto.randomUUID()}`);
      navigate('/settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-1">登录</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">登录后可同步个人资料与设置</p>

        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 rounded-2xl px-4 py-3 text-sm">
              已登录：{userProfile.userId}
            </div>
            <button
              onClick={handleGoSettings}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              返回个人中心
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">手机号</label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  placeholder="请输入手机号"
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">密码</label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="请输入密码"
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? '登录中...' : '登录'}
            </button>

            <button
              onClick={handleGoSettings}
              className="w-full py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
              跳过登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

