import { Home, Camera, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionType, setShowPaywall } = useUserStore();
  
  const isHomeActive = location.pathname === "/";
  const isProfileActive = location.pathname === "/settings";

  const handleCameraClick = () => {
    if (subscriptionType === 'free') {
      setShowPaywall(true);
    } else {
      navigate("/?photo=1");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 relative">
        {/* 首页按钮 */}
        <button
          onClick={() => navigate("/")}
          className={cn(
            "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
            isHomeActive 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home 
            className={cn(
              "h-6 w-6 transition-all",
              isHomeActive && "fill-primary/20"
            )} 
          />
          <span className="text-xs font-medium">首页</span>
        </button>

        {/* 中间拍照按钮 - 突出悬浮样式 */}
        <button
          onClick={handleCameraClick}
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-16 h-16 rounded-full bg-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Camera className="h-7 w-7 text-background" />
        </button>

        {/* 我的按钮 */}
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
            isProfileActive 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User 
            className={cn(
              "h-6 w-6 transition-all",
              isProfileActive && "fill-primary/20"
            )} 
          />
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>
    </nav>
  );
};
