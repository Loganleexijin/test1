import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Mail,
  X,
  LogIn,
  CheckCircle,
  Pencil,
  Sprout,
  Flame,
  CalendarCheck,
  Wallet,
  ScanLine,
  Dna,
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useFastingStore } from '@/store/fastingStore';
import { supabase } from '@/lib/supabase';
import { buildBadges, computeBadgeStats } from '@/utils/badges';

const PRIVACY_TEXT = `1. 信息收集范围\n\n我们可能收集账号信息（手机号、昵称、头像）、健康数据（断食记录、体征数据）等。\n\n2. 信息使用方式\n\n用于功能实现、数据统计与产品优化。\n\n3. 信息存储与保护\n\n我们采用合理的安全措施保护信息安全。\n\n4. 第三方服务\n\n可能包含 AI 分析、云存储等第三方服务组件。\n\n5. 用户权利\n\n您可查看、修改、导出或删除个人数据。\n\n6. Cookie 与追踪\n\n可能使用必要的本地存储用于功能运行。\n\n7. 政策更新\n\n政策更新时会在应用内提示。`;

const BADGE_META = {
  badge_first_fast: {
    icon: Sprout,
    gradient: 'from-orange-500 to-yellow-400',
  },
  badge_fat_burning: {
    icon: Flame,
    gradient: 'from-red-500 to-purple-600',
  },
  badge_autophagy: {
    icon: Dna,
    gradient: 'from-blue-500 to-cyan-400',
  },
  badge_7day_streak: {
    icon: CalendarCheck,
    gradient: 'from-amber-400 to-yellow-50',
  },
  badge_money_saved: {
    icon: Wallet,
    gradient: 'from-green-500 to-emerald-400',
  },
  badge_ai_explorer: {
    icon: ScanLine,
    gradient: 'from-purple-500 to-pink-500',
  },
};

type BadgeMetaKey = keyof typeof BADGE_META;

export default function Settings() {
  const {
    authToken,
    userProfile,
    historySessions,
    currentSession,
    userStats,
    mealRecords,
    aiResults,
    resetAll,
    updateUserProfile,
  } = useFastingStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [profileError, setProfileError] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    return computeBadgeStats({
      historySessions,
      currentSession,
      userStats,
      mealRecords,
      aiResults,
    });
  }, [historySessions, currentSession, userStats, mealRecords, aiResults]);

  const badges = useMemo(() => buildBadges(stats), [stats]);

  const initials = userProfile.nickname.trim().slice(0, 1) || 'F';
  const isSynced = Boolean(authToken);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/settings`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google 登录失败，请重试');
    }
  };

  useEffect(() => {
    if (!showProfileEdit) return;
    setProfileName(userProfile.nickname || 'Flux 用户');
    setProfileAvatar(userProfile.avatarDataUrl);
    setProfileError('');
  }, [showProfileEdit, userProfile.nickname, userProfile.avatarDataUrl]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('请选择图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(reader.result as string);
      setProfileError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      setProfileError('请输入昵称');
      return;
    }
    updateUserProfile({
      nickname: trimmed,
      avatarDataUrl: profileAvatar,
    });
    setShowProfileEdit(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">我的</h1>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开设置"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {userProfile.avatarDataUrl ? (
              <img
                src={userProfile.avatarDataUrl}
                alt="avatar"
                className="w-14 h-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {userProfile.nickname || 'Flux 用户'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isSynced ? '已同步数据' : '尚未同步'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isSynced && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <button
                onClick={() => setShowProfileEdit(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">勋章墙</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {userStats.badgesUnlocked.length}/{badges.length}
              </span>
              <button
                onClick={() => setShowAllBadges(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                全部
              </button>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mb-3">左右滑动查看</div>
          <div className="grid grid-flow-col auto-cols-[calc(50%-0.5rem)] gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {badges.map((badge) => {
              const meta = BADGE_META[badge.id as BadgeMetaKey];
              if (!meta) return null;
              const Icon = meta.icon;
              const isUnlocked = userStats.badgesUnlocked.includes(badge.id) && badge.unlocked;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-3 border transition-all snap-start ${
                    isUnlocked
                      ? `bg-gradient-to-br ${meta.gradient} text-white border-transparent`
                      : 'bg-gray-50 dark:bg-gray-700/40 text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-white/20' : 'bg-white dark:bg-gray-800'}`}>
                      <Icon className={`w-4 h-4 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-sm font-bold truncate">{badge.name}</span>
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    {isUnlocked ? '已解锁' : badge.remainingText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNavigation />

      {drawerOpen && (
        <div className="fixed inset-0 z-[120] bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">设置</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="关闭设置"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto px-4 py-6 space-y-6 overflow-y-auto h-[calc(100dvh-64px)]">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">同步数据（Google）</span>
                </div>
                <span className={`text-xs ${isSynced ? 'text-green-500' : 'text-gray-400'}`}>
                  {isSynced ? '已同步' : '未同步'}
                </span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowPrivacy(true)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">隐私政策</span>
                </div>
                <span className="text-xs text-gray-400">查看</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-between px-5 py-4 text-left border-t border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-600">清空所有数据</span>
                </div>
              </button>

              <button
                onClick={() => setShowContact(true)}
                className="w-full flex items-center justify-between px-5 py-4 text-left border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">联系我们</span>
                </div>
                <span className="text-xs text-gray-400">反馈建议</span>
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowProfileEdit(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="关闭编辑"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">编辑资料</h2>

            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="relative">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-3xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-orange-100 text-orange-700 flex items-center justify-center text-3xl font-bold">
                    {initials}
                  </div>
                )}
                <label className="absolute -bottom-2 right-0 bg-blue-600 text-white rounded-full px-3 py-1 text-xs cursor-pointer shadow">
                  更换头像
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">昵称</label>
              <input
                value={profileName}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  setProfileError('');
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入昵称"
              />
            </div>

            {profileError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mt-4">
                {profileError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllBadges && (
        <div className="fixed inset-0 z-[130] bg-white dark:bg-gray-900">
          <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">全部勋章</h2>
              <button
                onClick={() => setShowAllBadges(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="关闭全部勋章"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 grid grid-cols-2 gap-4">
            {badges.map((badge) => {
              const meta = BADGE_META[badge.id as BadgeMetaKey];
              if (!meta) return null;
              const Icon = meta.icon;
              const isUnlocked = userStats.badgesUnlocked.includes(badge.id) && badge.unlocked;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${meta.gradient} text-white border-transparent`
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-white/20' : 'bg-white dark:bg-gray-800'}`}>
                      <Icon className={`w-4 h-4 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-sm font-bold truncate">{badge.name}</span>
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    {isUnlocked ? '已解锁' : badge.remainingText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 z-[130] bg-white dark:bg-gray-900">
          <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">隐私政策</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {PRIVACY_TEXT}
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">确认清空数据</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">此操作将清除所有断食记录和设置，无法恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => {
                  resetAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[140] p-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">👨‍💻</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">联系开发者</h2>
              <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name</div>
                  <div className="font-bold text-gray-900 dark:text-white">Lee</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</div>
                  <div className="font-bold text-gray-900 dark:text-white">379537804@qq.com</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WeChat</div>
                  <div className="font-bold text-gray-900 dark:text-white">L379537804000</div>
                </div>
              </div>
              <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">
                感谢您的坚持使用，欢迎随时反馈。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
