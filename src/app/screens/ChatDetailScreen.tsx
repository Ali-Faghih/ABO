import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { useAuth } from "../contexts/AuthContext";
import { getMessages, addMessage, getConversationById, updateConversation } from "../services/chatStore";
import { ArrowLeft, Building2, User, Phone, Send, Calendar } from "lucide-react";

export const ChatDetailScreen = ({ conversationId, onBack }: { conversationId: string; onBack: () => void }) => {
  const { user } = useAuth();
  const [conv, setConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => { getConversationById(conversationId).then(setConv); }, [conversationId]);
  useEffect(() => { updateConversation(conversationId, { unread: 0 }); }, [conversationId]);
  useEffect(() => {
    const f = async () => { setMessages(await getMessages(conversationId)); };
    f();
    const iv = setInterval(f, 3000);
    return () => clearInterval(iv);
  }, [conversationId]);
  const isDonor = user?.type === "donor";
  const partnerName = isDonor ? conv?.hospitalName ?? "" : conv?.donorName ?? "";
  const partnerIcon = isDonor ? <Building2 size={18} className="text-primary" /> : <User size={18} className="text-primary" />;
  const sendMessage = async () => {
    if (!msg.trim() || !conv || !user) return;
    const timestamp = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    await addMessage({ id: `MSG-${Date.now()}`, conversationId: conv.id, senderId: user.id, text: msg.trim(), timestamp });
    await updateConversation(conv.id, { lastMessage: msg.trim(), lastMessageTime: timestamp });
    setMsg("");
    setMessages(await getMessages(conversationId));
  };
  if (!conv) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">مکالمه یافت نشد</div>;
  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white border-b border-border/30 flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <div className="w-10 h-10 bg-primary/8 rounded-full flex items-center justify-center flex-shrink-0">{partnerIcon}</div>
          <div className="flex-1 text-right"><p className="text-sm font-bold text-foreground">{partnerName}</p><p className="text-[11px] text-green-500 font-medium">● آنلاین</p></div>
          <button className="w-9 h-9 bg-muted/60 rounded-full flex items-center justify-center flex-shrink-0"><Phone size={16} className="text-foreground" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((message) => {
          const isMe = message.senderId === user?.id;
          return (
            <div key={message.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-white text-foreground rounded-bl-sm shadow-sm border border-border/20"}`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`} style={{ direction: "ltr", textAlign: isMe ? "left" : "right" }}>{message.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white border-t border-border/30 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${msg ? "bg-primary" : "bg-muted"}`} onClick={sendMessage}>
          <Send size={17} className={msg ? "text-white" : "text-muted-foreground"} />
        </button>
        <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="پیام..." className="flex-1 bg-muted/60 rounded-2xl px-4 py-2.5 text-sm outline-none text-right placeholder:text-muted-foreground/60" style={{ direction: "rtl" }} />
      </div>
    </div>
  );
};
