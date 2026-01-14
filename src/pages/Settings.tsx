import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  ChevronRight,
  ClipboardCopy,
  FileText,
  Flame,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  PiggyBank,
  Phone,
  ScanLine,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  TrendingDown,
  User,
  Wallet,
  Dna,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import { useFastingStore } from '@/store/fastingStore';

type SubScreen =
  | 'main'
  | 'metabolicDetail'
  | 'avatar'
  | 'nickname'
  | 'phone'
  | 'password'
  | 'notifications'
  | 'mealCost'
  | 'weight'
  | 'terms'
  | 'privacy'
  | 'dataCollection'
  | 'deleteAccount';

const toHex = (buffer: ArrayBuffer | Uint8Array) => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const createSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

const hashPassword = async (password: string, salt: string) => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatHours = (hours: number) => {
  if (!Number.isFinite(hours)) return '--';
  if (hours < 1) return `${Math.round(hours * 60)} 分钟`;
  return `${hours.toFixed(hours < 10 ? 1 : 0)} 小时`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const getDayKey = (timestamp: number) => {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getTodayKey = () => getDayKey(Date.now());

const getAvatarBg = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 70% 92%)`;
};

const getAvatarText = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 55% 35%)`;
};

const passwordStrength = (password: string) => {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const len = password.length;

  let score = 0;
  if (len >= 8) score += 1;
  if (hasLetter && hasNumber) score += 1;
  if (hasSymbol) score += 1;
  if (hasUpper) score += 1;
  if (len >= 12) score += 1;

  if (len < 8 || (!hasLetter && hasNumber) || (hasLetter && !hasNumber)) return { label: '弱', color: 'bg-red-500', bars: 1 };
  if (score >= 4) return { label: '强', color: 'bg-green-500', bars: 5 };
  return { label: '中等', color: 'bg-orange-500', bars: 3 };
};

const TERMS_UPDATED_AT = '2026-01-01';
const PRIVACY_UPDATED_AT = '2026-01-01';
const DATA_COLLECTION_UPDATED_AT = '2026-01-01';

const TERMS_TEXT = `1. 协议接受与变更\n\n当您使用 Flux 相关服务即表示同意本协议。我们可能会更新本协议并在应用内提示。\n\n2. 服务内容与使用规范\n\nFlux 提供断食计时、数据记录、可视化展示等功能。您应合理使用，不进行任何非法用途。\n\n3. 用户权利与义务\n\n您有权管理个人信息、查看与删除数据，并对账号安全负责。\n\n4. 知识产权声明\n\nFlux 的界面、商标、代码与内容受法律保护。\n\n5. 免责条款\n\nFlux 提供的内容仅作健康管理参考，不构成医疗建议。如有疾病请咨询医生。\n\n6. 争议解决\n\n如发生争议，双方应友好协商解决。`;

const PRIVACY_TEXT = `1. 信息收集范围\n\n我们可能收集账号信息（手机号、昵称、头像）、健康数据（断食记录、体征数据）等。\n\n2. 信息使用方式\n\n用于功能实现、数据统计与产品优化。\n\n3. 信息存储与保护\n\n我们采用合理的安全措施保护信息安全。\n\n4. 第三方服务\n\n可能包含 AI 分析、云存储等第三方服务组件。\n\n5. 用户权利\n\n您可查看、修改、导出或删除个人数据。\n\n6. Cookie 与追踪\n\n可能使用必要的本地存储用于功能运行。\n\n7. 政策更新\n\n政策更新时会在应用内提示。`;

export default function Settings() {
  const navigate = useNavigate();
  const {
    currentSession,
    historySessions,
    subscriptionType,
    aiResults,
    mealRecords,
    authToken,
    passwordHash,
    passwordSalt,
    userProfile,
    userStats,
    updateUserProfile,
    updateUserStats,
    setAuthToken,
    setPasswordCreds,
    clearAllData,
    resetAll,
  } = useFastingStore();

  const [screen, setScreen] = useState<SubScreen>('main');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const metabolicPressRef = useRef<number | null>(null);
  const metabolicDidLongPressRef = useRef(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);

  const [nicknameDraft, setNicknameDraft] = useState(userProfile.nickname);
  const [nicknameError, setNicknameError] = useState('');

  const [mealCostDraft, setMealCostDraft] = useState(String(userStats.mealCostSetting ?? 30));
  const [mealCostError, setMealCostError] = useState('');
  const [weightInitialDraft, setWeightInitialDraft] = useState(userStats.initialWeight == null ? '' : String(userStats.initialWeight));
  const [weightCurrentDraft, setWeightCurrentDraft] = useState(userStats.currentWeight == null ? '' : String(userStats.currentWeight));
  const [weightError, setWeightError] = useState('');
  const [actualAgeDraft, setActualAgeDraft] = useState(userStats.actualAge == null ? '' : String(userStats.actualAge));
  const [actualAgeError, setActualAgeError] = useState('');

  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordResetMode, setPasswordResetMode] = useState(false);

  const [phoneDraft, setPhoneDraft] = useState(userProfile.phone ?? '');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpExpireAt, setOtpExpireAt] = useState<number | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);

  const [avatarBusy, setAvatarBusy] = useState(false);

  const [deleteStep, setDeleteStep] = useState<'warning' | 'verify' | 'confirm' | 'processing'>('warning');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const isPro = useMemo(() => subscriptionType !== 'free', [subscriptionType]);

  const sessionDurationsHours = useMemo(() => {
    const history = historySessions.map((s) => (s.duration_minutes || 0) / 60);
    const current = currentSession && currentSession.fasting_status === 'fasting'
      ? Math.max(0, (Date.now() - currentSession.start_at) / 3600000)
      : 0;
    return { history, current };
  }, [historySessions, currentSession]);

  const statsComputed = useMemo(() => {
    const totalHistoryHours = sessionDurationsHours.history.reduce((a, b) => a + b, 0);
    const totalHours = totalHistoryHours + sessionDurationsHours.current;
    const deepAutophagyHours = sessionDurationsHours.history.reduce((sum, h) => sum + Math.max(0, h - 16), 0) + Math.max(0, sessionDurationsHours.current - 16);
    const longest = Math.max(0, ...sessionDurationsHours.history, sessionDurationsHours.current);
    const completedCount = historySessions.filter((s) => s.completed).length;
    const fastingDays = new Set(historySessions.filter((s) => s.end_at).map((s) => getDayKey(s.end_at as number))).size;

    const mealCost = userStats.mealCostSetting || 30;
    const moneySaved = completedCount * mealCost;

    const initialWeight = userStats.initialWeight;
    const currentWeight = userStats.currentWeight;
    const weightLoss = initialWeight != null && currentWeight != null ? initialWeight - currentWeight : 0;

    const actualAge = userStats.actualAge ?? null;
    const metabolicAge = actualAge == null
      ? null
      : Math.max(actualAge - fastingDays * 0.05 - weightLoss * 0.5, actualAge - 5);

    const completedDayKeys = Array.from(new Set(historySessions.filter((s) => s.completed && s.end_at).map((s) => getDayKey(s.end_at as number)))).sort().reverse();
    let streak = 0;
    let cursor = completedDayKeys[0] ?? null;
    while (cursor) {
      const expected = new Date(cursor);
      if (streak === 0) {
        streak = 1;
      } else {
        const prev = new Date(completedDayKeys[streak - 1]);
        const prevMinus1 = new Date(prev.getTime() - 24 * 60 * 60 * 1000);
        const prevKey = getDayKey(prevMinus1.getTime());
        if (completedDayKeys[streak] === prevKey) {
          streak += 1;
        } else {
          break;
        }
      }
      if (streak >= completedDayKeys.length) break;
      cursor = completedDayKeys[streak] ?? null;
      void expected;
    }

    const aiUseCount = mealRecords.filter((m) => Boolean(m.aiAnalysis)).length + aiResults.size;

    return {
      totalHours,
      deepAutophagyHours,
      longest,
      completedCount,
      fastingDays,
      moneySaved,
      weightLoss,
      actualAge,
      metabolicAge,
      streak,
      aiUseCount,
      mealCost,
    };
  }, [historySessions, sessionDurationsHours, userStats.mealCostSetting, userStats.initialWeight, userStats.currentWeight, userStats.actualAge, mealRecords, aiResults.size]);

  const badges = useMemo(() => {
    return [
      {
        id: 'badge_first_fast',
        name: '初次觉醒',
        icon: <Sprout className="w-5 h-5 text-white" />,
        gradient: 'from-orange-500 to-yellow-400',
        unlocked: statsComputed.completedCount >= 1,
        remainingText: statsComputed.completedCount >= 1 ? '' : '还需完成 1 次',
        congrats: '欢迎来到灵动断食的世界！你已迈出改变的第一步。',
      },
      {
        id: 'badge_fat_burning',
        name: '燃脂大师',
        icon: <Flame className="w-5 h-5 text-white" />,
        gradient: 'from-red-500 to-purple-600',
        unlocked: statsComputed.longest >= 18,
        remainingText: statsComputed.longest >= 18 ? '' : `还差 ${(18 - statsComputed.longest).toFixed(1)} 小时`,
        congrats: '您已触达深度燃脂区，脂肪正在燃烧！',
      },
      {
        id: 'badge_autophagy',
        name: '自噬专家',
        icon: <Dna className="w-5 h-5 text-white" />,
        gradient: 'from-blue-500 to-cyan-400',
        unlocked: statsComputed.deepAutophagyHours >= 50,
        remainingText: statsComputed.deepAutophagyHours >= 50 ? '' : `还差 ${Math.ceil(50 - statsComputed.deepAutophagyHours)} 小时`,
        congrats: '您的细胞正在焕发新生，这是真正的抗衰老。',
      },
      {
        id: 'badge_7day_streak',
        name: '七日连胜',
        icon: <CalendarCheck className="w-5 h-5 text-white" />,
        gradient: 'from-amber-400 to-yellow-50',
        unlocked: statsComputed.streak >= 7,
        remainingText: statsComputed.streak >= 7 ? '' : `还需坚持 ${7 - statsComputed.streak} 天`,
        congrats: '坚持就是胜利，习惯已经养成！',
      },
      {
        id: 'badge_money_saved',
        name: '省钱小能手',
        icon: <Wallet className="w-5 h-5 text-white" />,
        gradient: 'from-green-500 to-emerald-400',
        unlocked: statsComputed.moneySaved >= 500,
        remainingText: statsComputed.moneySaved >= 500 ? '' : `还差 ¥${Math.ceil(500 - statsComputed.moneySaved)}`,
        congrats: '健康与财富双丰收，给自己买个礼物吧！',
      },
      {
        id: 'badge_ai_explorer',
        name: 'AI 探索者',
        icon: <ScanLine className="w-5 h-5 text-white" />,
        gradient: 'from-purple-500 to-pink-500',
        unlocked: statsComputed.aiUseCount >= 10,
        remainingText: statsComputed.aiUseCount >= 10 ? '' : `还差 ${10 - statsComputed.aiUseCount} 次`,
        congrats: '您已掌握了科技断食的奥秘。',
      },
    ];
  }, [statsComputed]);

  const [flippedBadgeId, setFlippedBadgeId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    setNicknameDraft(userProfile.nickname);
  }, [userProfile.nickname]);

  useEffect(() => {
    setPhoneDraft(userProfile.phone ?? '');
  }, [userProfile.phone]);

  useEffect(() => {
    if (screen === 'mealCost') {
      setMealCostDraft(String(userStats.mealCostSetting ?? 30));
      setMealCostError('');
    }
    if (screen === 'weight') {
      setWeightInitialDraft(userStats.initialWeight == null ? '' : String(userStats.initialWeight));
      setWeightCurrentDraft(userStats.currentWeight == null ? '' : String(userStats.currentWeight));
      setWeightError('');
    }
    if (screen === 'metabolicDetail') {
      const currentAge = userStats.actualAge ?? null;
      setActualAgeDraft(currentAge == null ? '' : String(currentAge));
      setActualAgeError('');
    }
  }, [screen, userStats.actualAge, userStats.currentWeight, userStats.initialWeight, userStats.mealCostSetting]);

  useEffect(() => {
    const stored = new Set(userStats.badgesUnlocked);
    const newlyUnlocked = badges.filter((b) => b.unlocked && !stored.has(b.id)).map((b) => b.id);
    if (newlyUnlocked.length > 0) {
      updateUserStats({ badgesUnlocked: Array.from(new Set([...userStats.badgesUnlocked, ...newlyUnlocked])) });
    }
  }, [badges, updateUserStats, userStats.badgesUnlocked]);

  const renderHeader = (title: string) => {
    return (
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => setScreen('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <div className="w-9" />
        </div>
      </div>
    );
  };

  const nicknameValid = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 20) return '昵称长度为 2-20 个字符';
    if (!/^[\u4e00-\u9fa5A-Za-z0-9_]+$/.test(trimmed)) return '昵称仅支持中英文、数字和下划线';
    if (/^\d+$/.test(trimmed)) return '昵称不能为纯数字';
    return '';
  };

  const canChangeNickname = () => {
    const last = userProfile.nicknameLastChangedAt;
    const count = userProfile.nicknameChangedCount;
    if (!last) return true;
    const now = Date.now();
    const within30Days = now - last < 30 * 24 * 60 * 60 * 1000;
    if (!within30Days) return true;
    return count < 2;
  };

  const nextNicknameChangeText = () => {
    const last = userProfile.nicknameLastChangedAt;
    if (!last) return '';
    const next = new Date(last + 30 * 24 * 60 * 60 * 1000);
    return next.toLocaleDateString('zh-CN');
  };

  const handleSaveNickname = () => {
    setNicknameError('');
    const err = nicknameValid(nicknameDraft);
    if (err) {
      setNicknameError(err);
      return;
    }
    if (!canChangeNickname()) {
      setNicknameError(`昵称 30 天内最多修改 2 次，下次可修改时间：${nextNicknameChangeText()}`);
      return;
    }
    const now = Date.now();
    const within30Days = userProfile.nicknameLastChangedAt ? now - userProfile.nicknameLastChangedAt < 30 * 24 * 60 * 60 * 1000 : false;
    const newCount = within30Days ? userProfile.nicknameChangedCount + 1 : 1;
    updateUserProfile({
      nickname: nicknameDraft.trim(),
      nicknameChangedCount: newCount,
      nicknameLastChangedAt: now,
    });
    showToast('昵称已更新');
    setScreen('main');
  };

  const cropToSquareDataUrl = async (file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('load failed'));
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = Math.floor((img.naturalWidth - side) / 2);
    const sy = Math.floor((img.naturalHeight - side) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.drawImage(img, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(img.src);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handlePickAvatar = async (file: File | null) => {
    if (!file) return;
    setAvatarBusy(true);
    try {
      const dataUrl = await cropToSquareDataUrl(file);
      updateUserProfile({ avatarDataUrl: dataUrl });
      showToast('头像已更新');
    } catch {
      showToast('头像处理失败');
    } finally {
      setAvatarBusy(false);
    }
  };

  const otpRemainingSec = useMemo(() => {
    if (!otpSentAt) return 0;
    const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(0, 60 - elapsed);
  }, [otpSentAt]);

  useEffect(() => {
    if (!otpSentAt) return;
    const timer = window.setInterval(() => {
      setOtpSentAt((prev) => prev);
    }, 500);
    return () => window.clearInterval(timer);
  }, [otpSentAt]);

  const otpDailyKey = (phone: string) => `otp_daily_${getTodayKey()}_${phone}`;

  const getOtpDailyCount = (phone: string) => {
    try {
      const raw = localStorage.getItem(otpDailyKey(phone));
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  };

  const setOtpDailyCount = (phone: string, count: number) => {
    try {
      localStorage.setItem(otpDailyKey(phone), String(count));
    } catch {
      void 0;
    }
  };

  const handleSendOtp = async (targetPhone: string) => {
    setPhoneError('');
    const normalized = targetPhone.trim();
    if (!/^1\d{10}$/.test(normalized)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    if (otpRemainingSec > 0) return;
    const count = getOtpDailyCount(normalized);
    if (count >= 5) {
      setPhoneError('验证码发送次数已达上限，请明日再试');
      return;
    }
    setOtpBusy(true);
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtpCode(code);
      setOtpExpireAt(Date.now() + 10 * 60 * 1000);
      setOtpSentAt(Date.now());
      setOtpDailyCount(normalized, count + 1);
      showToast(`验证码已发送：${code}`);
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = (input: string) => {
    if (!otpCode || !otpExpireAt) return false;
    if (Date.now() > otpExpireAt) return false;
    return input.trim() === otpCode;
  };

  const handleBindPhone = () => {
    setPhoneError('');
    const normalized = phoneDraft.trim();
    if (!/^1\d{10}$/.test(normalized)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    if (!verifyOtp(phoneCode)) {
      setPhoneError('验证码错误或已过期');
      return;
    }
    updateUserProfile({ phone: normalized, phoneVerified: true });
    showToast('手机号已绑定');
    setScreen('main');
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    const strength = passwordStrength(passwordNew);
    const meets = passwordNew.length >= 8 && /[A-Za-z]/.test(passwordNew) && /\d/.test(passwordNew);
    if (!meets) {
      setPasswordError('密码需为 8-20 位，且包含字母和数字');
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    if (['123456', 'password', '12345678', 'qwerty'].includes(passwordNew.toLowerCase())) {
      setPasswordError('密码过于简单，请更换');
      return;
    }
    void strength;

    setPasswordBusy(true);
    try {
      if (userProfile.hasPassword && !passwordResetMode) {
        if (!passwordHash || !passwordSalt) {
          setPasswordError('密码数据异常，请使用重置流程');
          return;
        }
        const digest = await hashPassword(passwordOld, passwordSalt);
        if (digest !== passwordHash) {
          setPasswordError('原密码错误');
          return;
        }
      }

      const salt = createSalt();
      const digest = await hashPassword(passwordNew, salt);
      setPasswordCreds({ passwordHash: digest, passwordSalt: salt });
      setPasswordOld('');
      setPasswordNew('');
      setPasswordConfirm('');
      setPasswordResetMode(false);
      showToast('密码已更新');
      setScreen('main');
    } catch {
      setPasswordError('密码设置失败');
    } finally {
      setPasswordBusy(false);
    }
  };

  const notificationPermission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') return;
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') showToast('通知权限已开启');
      else showToast('未开启通知权限');
    } catch {
      showToast('无法请求通知权限');
    }
  };

  const toggleNotificationSetting = async (key: keyof typeof userProfile.notificationSettings, value: boolean) => {
    if (key === 'systemNotification') return;
    if (value) {
      await requestNotificationPermission();
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') return;
    }
    updateUserProfile({ notificationSettings: { ...userProfile.notificationSettings, [key]: value } });
  };



  const handleLogout = () => {
    setAuthToken(null);
    setShowLogoutConfirm(false);
    showToast('已退出登录');
    navigate('/login');
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    showToast('数据已清除');
  };

  const handleDeleteStart = () => {
    setDeleteStep('warning');
    setDeletePassword('');
    setDeleteCode('');
    setDeleteConfirmText('');
    setDeleteError('');
    setScreen('deleteAccount');
  };

  const handleDeleteVerify = async () => {
    setDeleteError('');
    if (userProfile.hasPassword) {
      if (!passwordHash || !passwordSalt) {
        setDeleteError('密码数据异常');
        return;
      }
      const digest = await hashPassword(deletePassword, passwordSalt);
      if (digest !== passwordHash) {
        setDeleteError('密码错误');
        return;
      }
      setDeleteStep('confirm');
      return;
    }
    if (!userProfile.phone || !userProfile.phoneVerified) {
      setDeleteError('请先绑定手机号或设置密码');
      return;
    }
    if (!verifyOtp(deleteCode)) {
      setDeleteError('验证码错误或已过期');
      return;
    }
    setDeleteStep('confirm');
  };

  const handleDeleteConfirm = async () => {
    setDeleteError('');
    if (deleteConfirmText.trim() !== '删除账号') return;
    setDeleteStep('processing');
    try {
      await fetch('/api/auth/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.userId }),
      });
    } catch {
      void 0;
    } finally {
      try {
        localStorage.removeItem('fasting-storage');
      } catch {
        void 0;
      }
      resetAll();
      showToast('账号已删除');
      navigate('/login');
    }
  };

  const renderRow = (icon: React.ReactNode, label: string, value?: React.ReactNode, onClick?: () => void, danger?: boolean) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 transition-colors ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-gray-50'}`}>
            {icon}
          </div>
          <div className={`font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</div>
        </div>
        <div className="flex items-center gap-2">
          {value ? <div className="text-sm text-gray-500">{value}</div> : null}
          <ChevronRight className={`w-5 h-5 ${danger ? 'text-red-300' : 'text-gray-300'}`} />
        </div>
      </button>
    );
  };

  const mainView = () => {
    const avatarFallback = userProfile.nickname.trim().slice(0, 1).toUpperCase() || 'F';
    const avatarBg = getAvatarBg(userProfile.userId);
    const avatarText = getAvatarText(userProfile.userId);

    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <style>{`
          @keyframes breatheProfile {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.02); opacity: 1; }
          }
          @keyframes rotateSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">个人中心</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-5 py-6 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <button
              onClick={() => setScreen('avatar')}
              className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-4 border-white shadow-sm active:scale-95 transition-transform"
              style={{ background: avatarBg, color: avatarText }}
            >
              {userProfile.avatarDataUrl ? (
                <img src={userProfile.avatarDataUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="text-3xl font-bold">{avatarFallback}</div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <button
                onClick={() => setScreen('nickname')}
                className="text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900 truncate">{userProfile.nickname}</div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-gray-100 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </div>
                </div>
              </button>
              
              <div className="mt-1 flex items-center gap-2">
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPro ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                  {isPro ? 'PRO MEMBER' : 'FREE PLAN'}
                </div>
              </div>
            </div>
          </div>

          <button
            onPointerDown={() => {
              metabolicDidLongPressRef.current = false;
              if (metabolicPressRef.current) window.clearTimeout(metabolicPressRef.current);
              metabolicPressRef.current = window.setTimeout(() => {
                metabolicDidLongPressRef.current = true;
                const text = `Flux 代谢年龄\n实际年龄：${statsComputed.actualAge ?? '--'}\n代谢年龄：${statsComputed.metabolicAge == null ? '--' : statsComputed.metabolicAge.toFixed(1)}\n累计断食天数：${statsComputed.fastingDays}\n减重：${userStats.initialWeight != null && userStats.currentWeight != null ? (userStats.initialWeight - userStats.currentWeight).toFixed(1) : '--'} kg`;
                if (navigator.share) {
                  navigator.share({ title: 'Flux 代谢年龄', text });
                } else {
                  navigator.clipboard.writeText(text).then(
                    () => showToast('已复制分享内容'),
                    () => showToast('无法分享'),
                  );
                }
              }, 550);
            }}
            onPointerUp={() => {
              if (metabolicPressRef.current) window.clearTimeout(metabolicPressRef.current);
              metabolicPressRef.current = null;
            }}
            onPointerCancel={() => {
              if (metabolicPressRef.current) window.clearTimeout(metabolicPressRef.current);
              metabolicPressRef.current = null;
            }}
            onClick={() => {
              if (metabolicDidLongPressRef.current) {
                metabolicDidLongPressRef.current = false;
                return;
              }
              setScreen('metabolicDetail');
            }}
            className="w-full text-left rounded-3xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center" style={{ animation: 'breatheProfile 3s ease-in-out infinite' }}>
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">代谢年龄</div>
                  <div className="text-xs text-gray-500">身心能量仪表盘</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  {statsComputed.metabolicAge == null ? '--' : statsComputed.metabolicAge.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">
                  实际年龄 {statsComputed.actualAge == null ? '--' : statsComputed.actualAge}
                </div>
              </div>
            </div>
            {statsComputed.metabolicAge != null && statsComputed.actualAge != null && (
              <div className="mt-3 text-sm text-gray-600">
                您的代谢状态年轻了 {(statsComputed.actualAge - statsComputed.metabolicAge).toFixed(1)} 岁
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 bg-white/80 border border-white">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-medium">细胞净化</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatHours(statsComputed.deepAutophagyHours)}</div>
                <div className="text-xs text-gray-400 mt-1">超过 16h 的部分累计</div>
              </div>
              <div className="rounded-2xl p-4 bg-white/80 border border-white">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">胰脏休假</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatHours(statsComputed.totalHours)}</div>
                <div className="text-xs text-gray-400 mt-1">累计断食时长</div>
              </div>
              <button
                onClick={() => setScreen('mealCost')}
                className="rounded-2xl p-4 bg-white/80 border border-white text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <PiggyBank className="w-4 h-4" />
                  <span className="text-xs font-medium">财富积累</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">¥ {Math.round(statsComputed.moneySaved)}</div>
                <div className="text-xs text-gray-400 mt-1">单餐 ¥{statsComputed.mealCost}</div>
              </button>
              <button
                onClick={() => setScreen('weight')}
                className="rounded-2xl p-4 bg-white/80 border border-white text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">热量与减重</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.initialWeight != null && userStats.currentWeight != null ? `${(userStats.initialWeight - userStats.currentWeight).toFixed(1)} kg` : '--'}</div>
                <div className="text-xs text-gray-400 mt-1">已减轻</div>
              </button>
            </div>
          </button>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">勋章墙</h2>
              <div className="text-xs text-gray-400">{userStats.badgesUnlocked.length}/{badges.length}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => {
                const isUnlocked = userStats.badgesUnlocked.includes(b.id) && b.unlocked;
                const isFlipped = flippedBadgeId === b.id;
                const longPressTimer = { current: 0 as number };

                const handlePressStart = () => {
                  longPressTimer.current = window.setTimeout(() => {
                    if (navigator.share) {
                      navigator.share({ title: `Flux 勋章：${b.name}`, text: b.congrats });
                      return;
                    }
                    navigator.clipboard.writeText(`${b.name}\n${b.congrats}`).then(
                      () => showToast('已复制分享内容'),
                      () => showToast('无法分享'),
                    );
                  }, 550);
                };

                const handlePressEnd = () => {
                  if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
                };

                return (
                  <button
                    key={b.id}
                    onPointerDown={handlePressStart}
                    onPointerUp={handlePressEnd}
                    onPointerCancel={handlePressEnd}
                    onClick={() => {
                      if (!b.unlocked) {
                        showToast(b.remainingText || '尚未解锁');
                        return;
                      }
                      setFlippedBadgeId((prev) => (prev === b.id ? null : b.id));
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm active:scale-[0.99] transition-transform"
                    style={{ perspective: 800 }}
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-300"
                      style={{ transformStyle: 'preserve-3d', transform: `rotateY(${isFlipped ? 180 : 0}deg)` }}
                    >
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} ${isUnlocked ? '' : 'opacity-40 grayscale'}`} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <div style={{ animation: isUnlocked ? 'rotateSlow 10s linear infinite' : 'none' }}>
                              {b.icon}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-white text-center leading-tight">{b.name}</div>
                        </div>
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        {!isUnlocked && b.remainingText && (
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] text-white/90 text-center">
                            {b.remainingText}
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                          <div className="text-sm font-bold text-gray-900">{b.name}</div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            获得于 {formatDate(Date.now())}
                          </div>
                          <div className="text-[11px] text-gray-600 mt-2 leading-snug">
                            {b.congrats}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">


            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900">账号与安全</div>
              </div>
              {renderRow(<Phone className="w-4 h-4 text-gray-600" />, '手机号', userProfile.phone ? maskPhone(userProfile.phone) : '未绑定', () => setScreen('phone'))}
              {renderRow(<Lock className="w-4 h-4 text-gray-600" />, '登录密码', userProfile.hasPassword ? '已设置' : '未设置', () => setScreen('password'))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900">消息通知</div>
              </div>
              {renderRow(<Bell className="w-4 h-4 text-gray-600" />, '通知设置', '', () => setScreen('notifications'))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900">法律与合规</div>
              </div>
              {renderRow(<FileText className="w-4 h-4 text-gray-600" />, '服务条款', '', () => setScreen('terms'))}
              {renderRow(<Shield className="w-4 h-4 text-gray-600" />, '隐私政策', '', () => setScreen('privacy'))}
              {renderRow(<FileText className="w-4 h-4 text-gray-600" />, '个人信息收集清单', '', () => setScreen('dataCollection'))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              {renderRow(<LogOut className="w-4 h-4 text-gray-600" />, '退出登录', '', () => setShowLogoutConfirm(true))}
              {renderRow(<Trash2 className="w-4 h-4 text-red-600" />, '删除账号', '', handleDeleteStart, true)}
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              {renderRow(<Trash2 className="w-4 h-4 text-red-600" />, '清除所有数据', '', () => setShowClearConfirm(true), true)}
            </div>
            
            <div className="text-center pt-2">
              <button 
                onClick={() => setShowContactUs(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors border-b border-gray-300 pb-0.5"
              >
                联系我们
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg z-[120] text-sm">
            {toast}
          </div>
        )}



        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">确认清除数据</h2>
              <p className="text-gray-600 mb-6">此操作将清除所有断食记录和设置，无法恢复。确定要继续吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
                >
                  确认清除
                </button>
              </div>
            </div>
          </div>
        )}

        {showContactUs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-6">
            <div 
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
              style={{ animation: 'modalPopup 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
            >
              <style>{`
                @keyframes modalPopup {
                  from { opacity: 0; transform: scale(0.8) translateY(20px); }
                  to { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}</style>
              
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />
              <div className="absolute top-20 -left-10 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-30" />

              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 mb-6">
                  <span className="text-3xl">👨‍💻</span>
                </div>
                
                <h2 className="text-2xl font-black text-gray-900 mb-1">联系开发者</h2>
                <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 uppercase tracking-widest mb-6">
                  Let's Talk
                </div>

                <div className="space-y-4 text-left bg-gray-50/80 rounded-2xl p-5 border border-gray-100 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name</div>
                      <div className="font-bold text-gray-900">Lee</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</div>
                      <div className="font-bold text-gray-900 truncate">379537804@qq.com</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WeChat</div>
                      <div className="font-bold text-gray-900 truncate">L379537804000</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500 leading-relaxed font-medium">
                  感谢您的坚持使用<br/>您的反馈会使我们的产品越来越好
                </div>

                <button
                  onClick={() => setShowContactUs(false)}
                  className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 active:scale-95 transition-all hover:bg-black"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">确认退出登录？</h2>
              <p className="text-gray-600 mb-6">退出后您的数据仍会保留在本地，下次登录可继续使用。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNavigation />
      </div>
    );
  };

  const docView = (title: string, text: string, updatedAt: string) => {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader(title)}
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {text}
            </div>
            <div className="mt-6 text-xs text-gray-400">
              最后更新：{updatedAt}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const dataCollectionView = () => {
    const rows = [
      { type: '账号信息', content: '手机号、密码、昵称、头像', use: '账号识别、登录验证', required: '必需' },
      { type: '健康数据', content: '体重、身高、年龄、断食记录', use: '功能实现、数据统计', required: '必需' },
      { type: '设备信息', content: '设备型号、操作系统版本、APP版本', use: '问题排查、兼容性优化', required: '必需' },
      { type: '相机/相册', content: '食物照片（仅限AI分析使用）', use: 'AI 餐盘分析', required: '可选' },
      { type: '通知权限', content: '通知权限状态', use: '发送断食提醒', required: '可选' },
      { type: '使用行为', content: '页面访问、功能使用频次', use: '产品优化、功能改进', required: '可选' },
    ];
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('个人信息收集清单')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-700 leading-relaxed">
              我们不会收集您的通讯录、位置信息、剪贴板内容。所有健康数据仅用于功能实现与体验优化。
            </div>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-3">
              <div>类型</div>
              <div className="col-span-2">内容/用途</div>
              <div className="text-right">必需</div>
            </div>
            <div className="divide-y divide-gray-100">
              {rows.map((r) => (
                <div key={r.type} className="grid grid-cols-4 px-4 py-3 text-sm text-gray-700">
                  <div className="font-medium">{r.type}</div>
                  <div className="col-span-2 text-xs text-gray-500 leading-snug">
                    {r.content}
                    <div className="text-[10px] text-gray-400 mt-0.5">{r.use}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">{r.required}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 px-1">最后更新：{DATA_COLLECTION_UPDATED_AT}</div>
        </div>
      </div>
    );
  };

  const avatarView = () => {
    const avatarFallback = userProfile.nickname.trim().slice(0, 1).toUpperCase() || 'F';
    const avatarBg = getAvatarBg(userProfile.userId);
    const avatarText = getAvatarText(userProfile.userId);
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('头像设置')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div
              className="w-32 h-32 rounded-3xl overflow-hidden flex items-center justify-center"
              style={{ background: avatarBg, color: avatarText }}
            >
              {userProfile.avatarDataUrl ? (
                <img src={userProfile.avatarDataUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="text-5xl font-bold">{avatarFallback}</div>
              )}
            </div>
            <div className="mt-4 w-full space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePickAvatar(e.target.files?.[0] ?? null)}
                />
                <div className="w-full py-3 text-center rounded-2xl bg-gray-900 text-white font-bold active:scale-[0.99] transition-transform">
                  {avatarBusy ? '处理中...' : '拍照'}
                </div>
              </label>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePickAvatar(e.target.files?.[0] ?? null)}
                />
                <div className="w-full py-3 text-center rounded-2xl bg-gray-100 text-gray-900 font-bold active:scale-[0.99] transition-transform">
                  从相册选择
                </div>
              </label>
              {userProfile.avatarDataUrl && (
                <button
                  onClick={() => {
                    updateUserProfile({ avatarDataUrl: null });
                    showToast('头像已删除');
                  }}
                  className="w-full py-3 text-center rounded-2xl bg-red-50 text-red-600 font-bold active:scale-[0.99] transition-transform"
                >
                  删除头像
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const nicknameView = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('昵称设置')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-3">昵称长度 2-20，支持中英文、数字和下划线</div>
            <div className="relative">
              <input
                value={nicknameDraft}
                onChange={(e) => setNicknameDraft(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                placeholder="请输入昵称"
              />
              <div className="absolute right-4 bottom-3 text-xs text-gray-400">{nicknameDraft.trim().length}/20</div>
            </div>
            {nicknameError && <div className="text-sm text-red-600 mt-3">{nicknameError}</div>}
          </div>
          <button
            onClick={handleSaveNickname}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            保存
          </button>
          {!canChangeNickname() && (
            <div className="text-xs text-gray-400 text-center">下次可修改时间：{nextNicknameChangeText()}</div>
          )}
        </div>
      </div>
    );
  };

  const phoneView = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('手机号设置')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
            <div className="text-sm text-gray-600">手机号用于登录和找回密码，请确保手机号真实有效</div>
            <input
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="请输入手机号"
            />
            <div className="flex gap-3">
              <input
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                inputMode="numeric"
                className="flex-1 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                placeholder="验证码"
              />
              <button
                onClick={() => handleSendOtp(phoneDraft)}
                disabled={otpBusy || otpRemainingSec > 0}
                className="px-4 rounded-2xl bg-gray-900 text-white font-bold disabled:opacity-60"
              >
                {otpRemainingSec > 0 ? `${otpRemainingSec}s` : '获取验证码'}
              </button>
            </div>
            {phoneError && <div className="text-sm text-red-600">{phoneError}</div>}
          </div>
          <button
            onClick={handleBindPhone}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            保存
          </button>
          <div className="text-xs text-gray-400 text-center">验证码 6 位数字，10 分钟有效；单日最多发送 5 次</div>
        </div>
      </div>
    );
  };

  const passwordView = () => {
    const strength = passwordStrength(passwordNew);
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('登录密码')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
            {userProfile.hasPassword && !passwordResetMode && (
              <>
                <input
                  value={passwordOld}
                  onChange={(e) => setPasswordOld(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                  placeholder="原密码"
                />
                <button
                  onClick={() => {
                    setPasswordResetMode(true);
                    setPasswordError('');
                    setPasswordOld('');
                  }}
                  className="text-sm text-orange-600 font-semibold text-left"
                >
                  忘记密码？
                </button>
              </>
            )}

            {passwordResetMode && (
              <div className="text-sm text-gray-600">
                通过手机号验证码重置密码（需已绑定手机号）
              </div>
            )}

            {passwordResetMode && (
              <div className="flex gap-3">
                <input
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  inputMode="numeric"
                  className="flex-1 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                  placeholder="验证码"
                />
                <button
                  onClick={() => {
                    if (!userProfile.phone) {
                      setPasswordError('请先绑定手机号');
                      return;
                    }
                    handleSendOtp(userProfile.phone);
                  }}
                  disabled={otpBusy || otpRemainingSec > 0}
                  className="px-4 rounded-2xl bg-gray-900 text-white font-bold disabled:opacity-60"
                >
                  {otpRemainingSec > 0 ? `${otpRemainingSec}s` : '获取验证码'}
                </button>
              </div>
            )}

            <input
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              type="password"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="新密码"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">密码强度</div>
              <div className="text-sm text-gray-600">{strength.label}</div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i <= strength.bars ? strength.color : 'bg-gray-200'}`} />
              ))}
            </div>
            <input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type="password"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="确认密码"
            />
            {passwordError && <div className="text-sm text-red-600">{passwordError}</div>}
            {!userProfile.hasPassword && (
              <div className="text-xs text-gray-400">建议使用字母+数字+符号组合，提升安全性</div>
            )}
          </div>

          <button
            onClick={async () => {
              if (passwordResetMode) {
                if (!verifyOtp(deleteCode)) {
                  setPasswordError('验证码错误或已过期');
                  return;
                }
              }
              await handleSavePassword();
            }}
            disabled={passwordBusy}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60"
          >
            {passwordBusy ? '处理中...' : '完成'}
          </button>

          {userProfile.hasPassword && (
            <button
              onClick={() => {
                setPasswordCreds(null);
                showToast('密码已移除');
                setScreen('main');
              }}
              className="w-full py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              移除密码（仅本地）
            </button>
          )}
        </div>
      </div>
    );
  };

  const notificationsView = () => {
    const ns = userProfile.notificationSettings;
    const permissionOk = notificationPermission === 'granted';
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('消息通知')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          {!permissionOk && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="text-sm font-bold text-yellow-800">通知权限未开启</div>
              <div className="text-xs text-yellow-800/80 mt-1">部分提醒功能无法使用，请在系统设置中开启通知权限</div>
              <button
                onClick={requestNotificationPermission}
                className="mt-3 px-4 py-2 rounded-full bg-yellow-600 text-white text-sm font-bold"
              >
                前往设置
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 pt-4 pb-2 font-bold text-gray-900">通知项</div>
            {([
              { key: 'fastingReminder', label: '断食提醒', defaultOn: true },
              { key: 'dailyCheckIn', label: '每日打卡提醒', defaultOn: true },
            ] as const).map((item) => {
              const value = ns[item.key as keyof typeof ns];
              return (
                <div key={item.key} className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    {item.key === 'dailyCheckIn' && (
                      <div className="text-xs text-gray-500 mt-0.5">提醒时间：{ns.dailyCheckInTime}</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      toggleNotificationSetting(item.key as any, !value);
                    }}
                    className={`w-12 h-7 rounded-full relative transition-colors ${value ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-all ${value ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              );
            })}
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">每日打卡提醒时间</div>
                <input
                  type="time"
                  value={ns.dailyCheckInTime}
                  onChange={(e) => updateUserProfile({ notificationSettings: { ...ns, dailyCheckInTime: e.target.value } })}
                  className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const mealCostView = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('单餐价格')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-2">
            <div className="text-sm text-gray-600">用于「财富积累」计算：完成断食次数 × 单餐价格</div>
            <input
              value={mealCostDraft}
              onChange={(e) => setMealCostDraft(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="例如 30"
            />
            {mealCostError && <div className="text-sm text-red-600">{mealCostError}</div>}
          </div>
          <button
            onClick={() => {
              setMealCostError('');
              const n = Number(mealCostDraft);
              if (!Number.isFinite(n)) {
                setMealCostError('请输入正确的数字');
                return;
              }
              const v = clampNumber(n, 1, 500);
              updateUserStats({ mealCostSetting: v });
              showToast('单餐价格已更新');
              setScreen('main');
            }}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            保存
          </button>
        </div>
      </div>
    );
  };

  const weightView = () => {
    const i = Number(weightInitialDraft);
    const c = Number(weightCurrentDraft);
    const loss = Number.isFinite(i) && Number.isFinite(c) ? i - c : null;

    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('体重设置')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
            <div className="text-sm text-gray-600">用于「热量与减重」展示与代谢年龄计算</div>
            <input
              value={weightInitialDraft}
              onChange={(e) => setWeightInitialDraft(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="初始体重（kg）"
            />
            <input
              value={weightCurrentDraft}
              onChange={(e) => setWeightCurrentDraft(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
              placeholder="当前体重（kg）"
            />
            {loss != null && (
              <div className="text-sm text-gray-600">
                已减轻：<span className="font-bold text-gray-900">{loss.toFixed(1)} kg</span>
              </div>
            )}
            {weightError && <div className="text-sm text-red-600">{weightError}</div>}
          </div>
          <button
            onClick={() => {
              setWeightError('');
              const i2 = Number(weightInitialDraft);
              const c2 = Number(weightCurrentDraft);
              if (!Number.isFinite(i2) || !Number.isFinite(c2)) {
                setWeightError('请输入正确的体重');
                return;
              }
              const iv = clampNumber(i2, 20, 300);
              const cv = clampNumber(c2, 20, 300);
              updateUserStats({ initialWeight: iv, currentWeight: cv });
              showToast('体重已更新');
              setScreen('main');
            }}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            保存
          </button>
        </div>
      </div>
    );
  };

  const metabolicDetailView = () => {
    const weightLoss = userStats.initialWeight != null && userStats.currentWeight != null ? userStats.initialWeight - userStats.currentWeight : 0;
    const ageNum = Number(actualAgeDraft);
    const metabolic = Number.isFinite(ageNum)
      ? Math.max(ageNum - statsComputed.fastingDays * 0.05 - weightLoss * 0.5, ageNum - 5)
      : null;
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('代谢年龄')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
            <div className="text-sm text-gray-600">MVP 计算依据</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-xs text-gray-500">累计断食天数</div>
                <div className="text-2xl font-bold text-gray-900">{statsComputed.fastingDays}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-xs text-gray-500">减重</div>
                <div className="text-2xl font-bold text-gray-900">{weightLoss.toFixed(1)} kg</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-500">实际年龄</div>
              <input
                value={actualAgeDraft}
                onChange={(e) => setActualAgeDraft(e.target.value)}
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 outline-none text-gray-900"
                placeholder="请输入实际年龄"
              />
              {actualAgeError && <div className="text-sm text-red-600 mt-2">{actualAgeError}</div>}
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-5 text-white">
              <div className="text-sm font-semibold opacity-95">代谢年龄</div>
              <div className="text-4xl font-extrabold mt-1">{metabolic == null ? '--' : metabolic.toFixed(1)}</div>
              {statsComputed.actualAge != null && metabolic != null && (
                <div className="text-sm mt-2 opacity-95">年轻了 {(statsComputed.actualAge - metabolic).toFixed(1)} 岁</div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setActualAgeError('');
              const n = Number(actualAgeDraft);
              if (!Number.isFinite(n) || n < 1 || n > 120) {
                setActualAgeError('请输入正确的年龄');
                return;
              }
              updateUserStats({ actualAge: n });
              showToast('实际年龄已更新');
              setScreen('main');
            }}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            保存
          </button>
        </div>
      </div>
    );
  };

  const deleteAccountView = () => {
    const hasPassword = userProfile.hasPassword;
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {renderHeader('删除账号')}
        <div className="max-w-md mx-auto px-5 py-6 space-y-4">
          {deleteStep === 'warning' && (
            <>
              <div className="bg-red-600 text-white rounded-3xl p-6 shadow-sm">
                <div className="text-lg font-bold">重要提示</div>
                <div className="text-sm mt-3 space-y-1">
                  <div>删除账号后，以下数据将永久删除且无法恢复：</div>
                  <div>• 所有断食记录和历史数据</div>
                  <div>• 已解锁的勋章和成就</div>
                  <div>• 会员权益（若有）</div>
                  <div>• 个人资料和设置</div>
                </div>
                <div className="text-sm mt-4 opacity-90">如果您只是想暂停使用，建议选择「退出登录」。</div>
              </div>
              <button
                onClick={() => setDeleteStep('verify')}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg"
              >
                继续删除
              </button>
            </>
          )}

          {deleteStep === 'verify' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="text-sm text-gray-600">验证身份</div>
              {hasPassword ? (
                <input
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                  placeholder="输入登录密码"
                />
              ) : (
                <>
                  <div className="text-xs text-gray-500">通过手机号验证码验证（未设置密码）</div>
                  <div className="flex gap-3">
                    <input
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value)}
                      inputMode="numeric"
                      className="flex-1 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                      placeholder="验证码"
                    />
                    <button
                      onClick={() => {
                        if (!userProfile.phone) {
                          setDeleteError('请先绑定手机号');
                          return;
                        }
                        handleSendOtp(userProfile.phone);
                      }}
                      disabled={otpBusy || otpRemainingSec > 0}
                      className="px-4 rounded-2xl bg-gray-900 text-white font-bold disabled:opacity-60"
                    >
                      {otpRemainingSec > 0 ? `${otpRemainingSec}s` : '获取验证码'}
                    </button>
                  </div>
                </>
              )}
              {deleteError && <div className="text-sm text-red-600">{deleteError}</div>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteStep('warning')}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold"
                >
                  返回
                </button>
                <button
                  onClick={handleDeleteVerify}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold"
                >
                  继续
                </button>
              </div>
            </div>
          )}

          {deleteStep === 'confirm' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="text-lg font-bold text-gray-900">最后确认</div>
              <div className="text-sm text-gray-600">请输入「删除账号」以确认操作</div>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 outline-none text-gray-900"
                placeholder="删除账号"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteStep('warning')}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText.trim() !== '删除账号'}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-50"
                >
                  确认删除
                </button>
              </div>
            </div>
          )}

          {deleteStep === 'processing' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-lg font-bold text-gray-900">正在删除您的账号...</div>
              <div className="text-sm text-gray-600 mt-2">请稍候</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (screen === 'main') return mainView();
  if (screen === 'metabolicDetail') return metabolicDetailView();
  if (screen === 'avatar') return avatarView();
  if (screen === 'nickname') return nicknameView();
  if (screen === 'phone') return phoneView();
  if (screen === 'password') return passwordView();
  if (screen === 'notifications') return notificationsView();
  if (screen === 'mealCost') return mealCostView();
  if (screen === 'weight') return weightView();
  if (screen === 'terms') return docView('服务条款', TERMS_TEXT, TERMS_UPDATED_AT);
  if (screen === 'privacy') return docView('隐私政策', PRIVACY_TEXT, PRIVACY_UPDATED_AT);
  if (screen === 'dataCollection') return dataCollectionView();
  if (screen === 'deleteAccount') return deleteAccountView();

  return mainView();
}
