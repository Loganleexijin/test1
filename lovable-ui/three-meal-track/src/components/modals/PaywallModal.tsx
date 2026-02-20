import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { Crown, Camera, Sparkles, Zap } from "lucide-react";

export const PaywallModal = () => {
  const { showPaywall, setShowPaywall } = useUserStore();

  const features = [
    { icon: Camera, text: "无限次 AI 拍照识别" },
    { icon: Sparkles, text: "个性化饮食建议" },
    { icon: Zap, text: "高级断食计划" },
  ];

  return (
    <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">解锁 Pro 会员</DialogTitle>
          <DialogDescription>
            升级 Pro 享受完整功能体验
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <Button className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            立即订阅 Pro
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setShowPaywall(false)}
          >
            暂不需要
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
