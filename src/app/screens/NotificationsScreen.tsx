import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { parsePersianDate } from "../lib/persian-calendar";
import { useAuth } from "../contexts/AuthContext";
import { getNotifications, markAllAsRead, seedDonorNotifications } from "../services/notificationStore";
import type { AppNotification } from "../services/notificationStore";
import type { DonorProfile } from "../types";
import { ArrowLeft, Bell, Clock, CheckCheck, CalendarDays, Heart, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props { onBack: () => void }

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  appointment: { icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
  reminder: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  system: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  request: { icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
};

export const NotificationsScreen = ({ onBack }: Props) => {
  const { user, updateProfile } = useAuth();
  const donor = user as DonorProfile | null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ months: number; days: number; hours: number } | null>(null);

  useEffect(() => {
    if (!donor) return;
    seedDonorNotifications(donor);
    setNotifications(getNotifications(donor.id));
    const iv = setInterval(() => setNotifications(getNotifications(donor.id)), 5000);
    return () => clearInterval(iv);
  }, [donor]);

  useEffect(() => {
    if (!donor || donor.eligible || !donor.nextEligible) { setTimeLeft(null); return; }
    const tick = () => {
      const target = parsePersianDate(donor.nextEligible!);
      if (!target) { setTimeLeft(null); return; }
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); updateProfile({ eligible: true, nextEligible: undefined }); return; }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      setTimeLeft({ months: Math.floor(totalHours / (30 * 24)), days: Math.floor((totalHours % (30 * 24)) / 24), hours: totalHours % 24 });
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, [donor, donor?.eligible, donor?.nextEligible, updateProfile]);

  const handleMarkRead = () => {
    if (!donor) return;
    markAllAsRead(donor.id);
    setNotifications(getNotifications(donor.id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0">
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <h1 className="text-lg font-bold text-foreground flex-1">اعلان‌ها</h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkRead} className="text-xs text-primary font-semibold flex items-center gap-1"><CheckCheck size={14} />خواندن همه</button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {timeLeft && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 shadow-lg shadow-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Clock size={20} className="text-white" /></div>
              <div className="flex-1">
                <p className="text-white/70 text-[11px]">زمان تا اهدای بعدی</p>
                <p className="text-white font-bold text-base">{timeLeft.months > 0 ? `${timeLeft.months} ماه ` : ""}{timeLeft.days} روز {timeLeft.hours} ساعت</p>
              </div>
            </div>
          </div>
        )}
        <div className="mx-4 mt-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/20 text-center">
              <Bell size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">اعلانی وجود ندارد.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? { icon: Info, color: "text-gray-600", bg: "bg-gray-50" };
                const Icon = cfg.icon;
                return (
                  <div key={n.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${n.read ? "border-border/20" : "border-primary/20"} transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={18} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${n.read ? "text-foreground" : "text-foreground"}`}>{n.title}</span>
                          <div className="flex items-center gap-1.5">
                            {!n.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                            <span className="text-[10px] text-muted-foreground">{n.time}</span>
                          </div>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground/80"}`}>{n.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
