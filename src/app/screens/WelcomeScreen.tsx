import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { StatusBar } from "../components/ui/StatusBar";
import { Droplets, Heart, UserPlus, Building2, LogIn, Info, Eye } from "lucide-react";

export const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { enterGuestMode, isAuthenticated, isGuest } = useAuth();

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate]);

  if (isAuthenticated || isGuest) return null;

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="flex-1 flex flex-col px-6 pb-6 overflow-y-auto">
        <div className="flex items-center justify-center mt-8 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/8 rounded-[2rem] flex items-center justify-center">
              <Droplets size={50} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -left-2 w-9 h-9 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Heart size={17} className="text-white fill-white" />
            </div>
          </div>
        </div>
        <div className="text-center mb-7">
          <h1 className="text-5xl font-black text-foreground tracking-tight mb-2">آ ب اُ</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">سامانه ملی اهدای خون<br />وزارت بهداشت، درمان و آموزش پزشکی</p>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium px-1">ثبت‌نام / ورود</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <button onClick={() => navigate("/register/donor")} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <UserPlus size={18} />
            ثبت‌نام اهداکننده
          </button>
          <button onClick={() => navigate("/register/hospital")} className="w-full bg-secondary text-white py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Building2 size={18} />
            ثبت‌نام بیمارستان / مرکز درمانی
          </button>
          <button onClick={() => navigate("/login")} className="w-full border-2 border-border py-3.5 rounded-2xl font-bold text-sm text-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:border-primary/30 transition-colors">
            <LogIn size={18} className="text-muted-foreground" />
            ورود با حساب موجود
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">ورود بدون ثبت‌نام محدود است. شما می‌توانید محیط برنامه را مرور کنید اما برای اقدامات اصلی نیاز به احراز هویت دارید.</p>
          </div>
          <button onClick={() => { enterGuestMode(); navigate("/app"); }} className="w-full bg-amber-100 text-amber-700 py-2.5 rounded-xl text-xs font-bold border border-amber-300 flex items-center justify-center gap-1.5">
            <Eye size={14} />
            مرور بدون ثبت‌نام (دسترسی محدود)
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
          با ثبت‌نام، قوانین و مقررات سامانه ملی اهدای خون را می‌پذیرید.
        </p>
      </div>
    </div>
  );
};
