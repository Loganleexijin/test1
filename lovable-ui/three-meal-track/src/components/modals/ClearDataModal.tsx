import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/stores/userStore";
import { AlertTriangle } from "lucide-react";

export const ClearDataModal = () => {
  const { showClearDataConfirm, setShowClearDataConfirm, resetAll } = useUserStore();

  const handleClearData = () => {
    resetAll();
    setShowClearDataConfirm(false);
  };

  return (
    <AlertDialog open={showClearDataConfirm} onOpenChange={setShowClearDataConfirm}>
      <AlertDialogContent className="max-w-sm mx-4 rounded-3xl">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            确定清空所有数据？
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            此操作将删除所有饮食记录、断食历史和个人设置。此操作不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleClearData}
            className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90"
          >
            确认删除
          </AlertDialogAction>
          <AlertDialogCancel className="w-full h-12 rounded-xl mt-0">
            取消
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
