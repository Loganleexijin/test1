import { Settings, ChevronRight } from "lucide-react";
import { useUserStore, buildBadges } from "@/stores/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SettingsDrawer } from "@/components/modals/SettingsDrawer";
import { EditProfileModal } from "@/components/modals/EditProfileModal";
import { PrivacyModal } from "@/components/modals/PrivacyModal";
import { ClearDataModal } from "@/components/modals/ClearDataModal";
import { ContactModal } from "@/components/modals/ContactModal";
import { PaywallModal } from "@/components/modals/PaywallModal";
import { WeightCurveCard } from "@/components/fasting/WeightCurveCard";

const ProfilePage = () => {
  const {
    userProfile,
    userStats,
    authToken,
    subscriptionType,
    setShowSettings,
    setShowEditProfile,
  } = useUserStore();

  const badges = buildBadges(userStats);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const displayName = userProfile.nickname || "Flux 用户";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const isSynced = !!authToken;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 顶部区域 */}
      <div className="h-12" />
      
      <div className="px-4 max-w-md mx-auto space-y-5">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80"
          >
            <Settings className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* 用户信息卡片 */}
        <Card className="p-5 rounded-3xl border-0 shadow-card">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-primary/10">
              {userProfile.avatarDataUrl ? (
                <AvatarImage src={userProfile.avatarDataUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-semibold">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={subscriptionType === 'pro' ? 'default' : 'secondary'}
                  className="text-xs uppercase tracking-wider"
                >
                  {subscriptionType === 'pro' ? 'Pro' : 'Free Plan'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {isSynced ? "✓ 已同步" : "尚未同步"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 rounded-full bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              编辑
            </button>
          </div>
        </Card>

        {/* 勋章墙 */}
        <Card className="p-5 rounded-3xl border-0 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">
              勋章墙
            </h3>
            <button className="flex items-center gap-1 text-sm text-primary font-medium">
              全部 ({badges.length})
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 横向滑动勋章列表 */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                className={`flex-shrink-0 w-24 p-3 rounded-2xl text-center transition-all ${
                  badge.unlocked
                    ? "bg-primary/10"
                    : "bg-muted/50 opacity-60"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className={`text-xs font-medium truncate ${
                  badge.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {badge.name}
                </p>
                {!badge.unlocked && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {badge.remainingText}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            ← 左右滑动查看更多 →
          </p>
        </Card>

        {/* 数据统计卡片 */}
        <Card className="p-5 rounded-3xl border-0 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">身心能量仪表盘</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-sm text-warning font-medium">实际年龄 --</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <span>✨</span>
                <span>细胞净化</span>
              </div>
              <p className="text-2xl font-bold text-foreground">0分钟</p>
              <p className="text-xs text-muted-foreground mt-1">超过16h的部分累计</p>
            </div>

            <div className="p-4 rounded-2xl bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <span>⏰</span>
                <span>胰脏休假</span>
              </div>
              <p className="text-2xl font-bold text-foreground">0分钟</p>
              <p className="text-xs text-muted-foreground mt-1">累计断食时长</p>
            </div>

            <div className="p-4 rounded-2xl bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <span>💰</span>
                <span>财富积累</span>
              </div>
              <p className="text-2xl font-bold text-foreground">¥0</p>
              <p className="text-xs text-muted-foreground mt-1">单餐 ¥{userStats.mealCostSetting}</p>
            </div>

            <div className="p-4 rounded-2xl bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <span>⚖️</span>
                <span>热量与减重</span>
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">已减轻</p>
            </div>
          </div>
        </Card>

        {/* 体重变化曲线 */}
        <WeightCurveCard
          onAddWeight={(weight) => {
            console.log('添加体重:', weight);
          }}
        />
      </div>

      {/* 底部导航 */}
      <BottomNavigation />

      {/* 弹层组件 */}
      <SettingsDrawer />
      <EditProfileModal />
      <PrivacyModal />
      <ClearDataModal />
      <ContactModal />
      <PaywallModal />
    </div>
  );
};

export default ProfilePage;
