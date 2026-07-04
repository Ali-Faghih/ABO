import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { getActiveRequests } from "../services/requestStore";
import { Lock, MapPin, ChevronDown } from "lucide-react";

export const GuestHomeScreen = ({ city, onCityClick, onLogin, onAction }: { city: string; onCityClick: () => void; onLogin: () => void; onAction: (fn: () => void) => void }) => {
  const [allRequests, setRequests] = useState(getActiveRequests());
  useEffect(() => { setRequests(getActiveRequests()); const iv = setInterval(() => setRequests(getActiveRequests()), 5000); return () => clearInterval(iv); }, []);
  const filtered = allRequests.filter((r) => r.city === city);
  const display = filtered.length > 0 ? filtered.slice(0, 2) : allRequests.slice(0, 2);
  return (
  <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    <div className="bg-white flex-shrink-0">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <span className="text-xs text-muted-foreground">سلام،</span>
          <div className="text-lg font-bold text-foreground">کاربر مهمان 👋</div>
        </div>
        <button onClick={onCityClick} className="flex items-center gap-1.5 bg-muted/70 px-3 py-1.5 rounded-full">
          <MapPin size={12} className="text-primary" />
          <span className="text-xs font-medium text-foreground">{city}</span>
          <ChevronDown size={11} className="text-muted-foreground" />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-4 mt-4 bg-primary rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock size={28} className="text-white" />
          </div>
          <p className="text-white font-bold text-sm mb-1">برای مشاهده اطلاعات شخصی</p>
          <p className="text-white/65 text-xs mb-4 leading-relaxed">وارد حساب کاربری شوید یا ثبت‌نام کنید</p>
          <button onClick={onLogin} className="bg-white text-primary px-6 py-2.5 rounded-xl text-xs font-bold">ورود / ثبت‌نام</button>
        </div>
      </div>
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onAction(() => {})} className="text-xs text-primary font-semibold">مشاهده همه</button>
          <h2 className="text-sm font-bold text-foreground">{filtered.length > 0 ? "درخواست‌های نزدیک" : "آخرین درخواست‌ها"}</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {display.map((req) => (
            <button key={req.id} onClick={() => onAction(() => {})} className="bg-white rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm border border-border/20 w-full text-right">
              <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black text-sm">{req.bloodType}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{req.hospitalName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{req.city}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};
