import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { 
  Cloud, 
  Shield, 
  Trash2, 
  MessageCircle,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const SettingsDrawer = () => {
  const { 
    showSettings, 
    setShowSettings, 
    authToken,
    registerWithEmail,
    loginWithEmail,
    logout,
    setShowPrivacy,
    setShowClearDataConfirm,
    setShowContact,
  } = useUserStore();

  const isSynced = !!authToken;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSync = () => {
    // TODO: Implement Google OAuth
    console.log("Google sync clicked");
  };

  const settingsItems = [
    {
      icon: Cloud,
      label: "同步数据",
      sublabel: isSynced ? "已连接 Google" : "使用 Google 同步",
      action: handleGoogleSync,
      rightElement: isSynced ? (
        <CheckCircle2 className="h-5 w-5 text-primary" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      ),
    },
    {
      icon: Shield,
      label: "隐私政策",
      sublabel: "查看我们的隐私政策",
      action: () => {
        setShowSettings(false);
        setShowPrivacy(true);
      },
      rightElement: <ChevronRight className="h-5 w-5 text-muted-foreground" />,
    },
    {
      icon: Trash2,
      label: "清空所有数据",
      sublabel: "删除所有本地数据",
      action: () => {
        setShowSettings(false);
        setShowClearDataConfirm(true);
      },
      rightElement: <ChevronRight className="h-5 w-5 text-muted-foreground" />,
      danger: true,
    },
    {
      icon: MessageCircle,
      label: "联系我们",
      sublabel: "获取帮助和反馈",
      action: () => {
        setShowSettings(false);
        setShowContact(true);
      },
      rightElement: <ChevronRight className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <Sheet open={showSettings} onOpenChange={setShowSettings}>
      <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
        <SheetHeader className="px-6 pb-4">
          <SheetTitle className="text-center">设置</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="space-y-1">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-secondary/50 ${
                item.danger ? "text-destructive" : "text-foreground"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.danger ? "bg-destructive/10" : "bg-secondary"
              }`}>
                <item.icon className={`h-5 w-5 ${
                  item.danger ? "text-destructive" : "text-foreground"
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
              {item.rightElement}
            </button>
          ))}
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
            <p className="text-sm font-medium text-foreground">账号</p>

            {authToken ? (
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={async () => {
                  setAuthLoading(true);
                  try {
                    await logout();
                    toast({ title: "已退出登录" });
                  } catch (e) {
                    toast({
                      title: "退出失败",
                      description: e instanceof Error ? e.message : "未知错误",
                      variant: "destructive",
                    });
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
              >
                退出登录
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="邮箱"
                    className="rounded-xl"
                    type="email"
                    autoComplete="email"
                  />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    className="rounded-xl"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="rounded-xl"
                    onClick={async () => {
                      setAuthLoading(true);
                      try {
                        await registerWithEmail(email.trim(), password);
                        toast({ title: "注册成功" });
                      } catch (e) {
                        toast({
                          title: "注册失败",
                          description: e instanceof Error ? e.message : "未知错误",
                          variant: "destructive",
                        });
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                    disabled={authLoading}
                  >
                    注册
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={async () => {
                      setAuthLoading(true);
                      try {
                        await loginWithEmail(email.trim(), password);
                        toast({ title: "登录成功" });
                      } catch (e) {
                        toast({
                          title: "登录失败",
                          description: e instanceof Error ? e.message : "未知错误",
                          variant: "destructive",
                        });
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                    disabled={authLoading}
                  >
                    登录
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
