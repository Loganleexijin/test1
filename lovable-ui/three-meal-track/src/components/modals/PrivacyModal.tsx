import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { ScrollArea } from "@/components/ui/scroll-area";

const PRIVACY_TEXT = `隐私政策

最后更新日期：2024年1月

一、信息收集

我们收集您在使用应用时提供的信息，包括：
- 账户信息：昵称、头像
- 饮食记录：餐食照片、营养数据
- 断食记录：开始/结束时间

二、信息使用

我们使用收集的信息用于：
- 提供和改进服务
- 个性化您的体验
- 发送通知和更新

三、信息存储

您的数据存储在本地设备上。如果您选择同步，数据将加密存储在云端。

四、信息共享

我们不会出售您的个人信息。我们可能在以下情况下共享信息：
- 经您同意
- 法律要求

五、数据安全

我们采取行业标准的安全措施保护您的信息。

六、您的权利

您可以随时：
- 访问您的数据
- 更正或删除数据
- 导出您的数据

七、联系我们

如有任何问题，请通过应用内"联系我们"功能联系。

八、政策更新

我们可能会更新本政策。重大变更将通过应用通知您。`;

export const PrivacyModal = () => {
  const { showPrivacy, setShowPrivacy } = useUserStore();

  return (
    <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-center">隐私政策</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {PRIVACY_TEXT}
          </div>
        </ScrollArea>

        <Button
          className="w-full h-12 rounded-xl mt-4"
          onClick={() => setShowPrivacy(false)}
        >
          我已阅读
        </Button>
      </DialogContent>
    </Dialog>
  );
};
