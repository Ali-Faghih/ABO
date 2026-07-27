import { User, BookOpen, Plus, MessageCircle, Home } from "lucide-react";
import type { Tab } from "../../types";

export const BottomNav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
  const items: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "profile", icon: User, label: "پروفایل" },
    { id: "magazine", icon: BookOpen, label: "مجله" },
    { id: "add", icon: Plus, label: "" },
    { id: "chat", icon: MessageCircle, label: "چت" },
    { id: "home", icon: Home, label: "خانه" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 z-40">
      <div className="flex items-center justify-around px-2 pb-5 pt-2">
        {items.map((item) =>
          item.id === "add" ? (
            <button key="add" onClick={() => onChange("add")} className="flex flex-col items-center">
              <div className={`-mt-7 w-[58px] h-[58px] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${active === "add" ? "bg-primary shadow-primary/30 scale-105" : "bg-primary shadow-primary/20"}`}>
                <Plus size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </button>
          ) : (
            <button key={item.id} onClick={() => onChange(item.id)} className="flex flex-col items-center gap-1 px-3 py-1">
              <item.icon size={22} strokeWidth={active === item.id ? 2.5 : 1.8} className={active === item.id ? "text-primary" : "text-foreground/30"} />
              <span className={`text-[10px] font-medium ${active === item.id ? "text-primary font-semibold" : "text-foreground/30"}`}>{item.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
