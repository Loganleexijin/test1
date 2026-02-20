import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/userStore";
import { Camera } from "lucide-react";

export const EditProfileModal = () => {
  const { 
    showEditProfile, 
    setShowEditProfile,
    userProfile,
    updateUserProfile 
  } = useUserStore();

  const [nickname, setNickname] = useState(userProfile.nickname);
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatarDataUrl);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!nickname.trim()) return;
    
    updateUserProfile({
      nickname: nickname.trim(),
      avatarDataUrl: avatarPreview,
    });
    setShowEditProfile(false);
  };

  const displayName = nickname || userProfile.nickname || "Flux 用户";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">编辑资料</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 头像编辑 */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-primary/10">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-lg">
                <Camera className="h-4 w-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* 昵称输入 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="rounded-xl h-12"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => setShowEditProfile(false)}
          >
            取消
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl"
            onClick={handleSave}
            disabled={!nickname.trim()}
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
