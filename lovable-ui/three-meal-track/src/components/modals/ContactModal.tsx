import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { Mail, MessageSquare, Copy, Check } from "lucide-react";
import { useState } from "react";

export const ContactModal = () => {
  const { showContact, setShowContact } = useUserStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@flux-fasting.app",
    },
    {
      icon: MessageSquare,
      label: "微信",
      value: "FluxFasting",
    },
  ];

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={showContact} onOpenChange={setShowContact}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">联系我们</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {contactInfo.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground truncate">{item.value}</p>
              </div>
              <button
                onClick={() => handleCopy(item.value, item.label)}
                className="w-9 h-9 rounded-full bg-card flex items-center justify-center transition-colors hover:bg-muted"
              >
                {copiedField === item.label ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl"
          onClick={() => setShowContact(false)}
        >
          关闭
        </Button>
      </DialogContent>
    </Dialog>
  );
};
