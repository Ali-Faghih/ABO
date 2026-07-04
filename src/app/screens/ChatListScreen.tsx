import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { useAuth } from "../contexts/AuthContext";
import { getConversationsForUser } from "../services/chatStore";
import { Search, MessageCircle, Building2, User, ChevronLeft } from "lucide-react";

export const ChatListScreen = ({ onChatSelect }: { onChatSelect: (id: string) => void }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(user ? getConversationsForUser(user.id) : []);
  useEffect(() => {
    if (!user) return;
    setConversations(getConversationsForUser(user.id));
    const iv = setInterval(() => setConversations(getConversationsForUser(user.id)), 5000);
    return () => clearInterval(iv);
  }, [user]);
  return (
  <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    <div className="bg-white flex-shrink-0">
      <StatusBar />
      <div className="px-5 pb-4">
        <h1 className="text-lg font-bold text-foreground mb-3">پیام‌ها</h1>
        <div className="flex items-center gap-2 bg-muted/70 rounded-2xl px-4 py-2.5">
          <Search size={15} className="text-muted-foreground" />
          <input placeholder="جستجو..." className="flex-1 bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/60" />
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto pb-24">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 h-full">
          <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={36} className="text-primary/40" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">پیامی وجود ندارد</p>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">وقتی با بیمارستان یا اهداکننده‌ای گفتگو کنید، اینجا نمایش داده می‌شود.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-4 pt-3">
          {conversations.map((c) => {
            const isDonor = user?.type === "donor";
            const name = isDonor ? c.hospitalName : c.donorName;
            const icon = isDonor ? <Building2 size={18} className="text-primary" /> : <User size={18} className="text-primary" />;
            return (
              <button key={c.id} onClick={() => onChatSelect(c.id)} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-border/20 w-full text-right">
                <div className="w-11 h-11 bg-primary/8 rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-foreground">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{c.lastMessage}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {c.unread > 0 && <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{c.unread}</span>}
                  <ChevronLeft size={15} className="text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};
