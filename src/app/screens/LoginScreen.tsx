import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { findUserByUsername } from "../services/authStorage";
import { StatusBar } from "../components/ui/StatusBar";
import { ArrowLeft, Droplets, User, EyeOff, Eye, LogIn, AlertCircle, Shield, Info, Lock } from "lucide-react";
import type { UserType } from "../types";

export const LoginScreen = () => {
  const { login, isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<UserType>("donor");
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [foundPassword, setFoundPassword] = useState<string | null>(null);

  const handleForgotLookup = () => {
    const user = findUserByUsername(forgotUsername.trim());
    setFoundPassword(user ? user.password : null);
  };

  const handleSubmit = () => {
    const result = login(username, password, activeType);
    if (!result.success) setError(result.error ?? "خطا در ورود");
    else { setError(""); navigate("/app", { replace: true }); }
  };

  const handleBack = () => navigate(isAuthenticated || isGuest ? "/app" : "/");

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="px-5 pt-3 pb-4 border-b border-border/30">
        <button onClick={handleBack} className="mb-4 w-9 h-9 flex items-center justify-center rounded-xl bg-muted/60">
          <ArrowLeft size={19} className="text-foreground rotate-180" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Droplets size={20} className="text-primary" />
          </div>
          <div>
            <span className="text-xl font-black text-foreground">آ ب اُ</span>
            <p className="text-[10px] text-muted-foreground">سامانه ملی اهدای خون</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground">ورود به حساب</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          {(["donor", "hospital"] as UserType[]).map((t) => (
            <button key={t} onClick={() => setActiveType(t)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeType === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
              {t === "donor" ? "👤 اهداکننده" : "🏥 بیمارستان"}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-foreground mb-2 block">{activeType === "donor" ? "کد ملی / شماره موبایل" : "نام کاربری / کد بیمارستان"} <span className="text-primary">*</span></label>
          <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
            <User size={16} className="text-muted-foreground flex-shrink-0" />
            <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder={activeType === "donor" ? "1532620591" : "TEH-202D"} className="flex-1 bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/50" style={{ direction: "ltr" }} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-foreground mb-2 block">رمز عبور <span className="text-primary">*</span></label>
          <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
            <button onClick={() => setShowPass(!showPass)} className="flex-shrink-0">
              {showPass ? <EyeOff size={16} className="text-muted-foreground" /> : <Eye size={16} className="text-muted-foreground" />}
            </button>
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className="flex-1 bg-transparent text-sm outline-none" style={{ direction: "ltr", textAlign: "right" }} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(activeType === "donor" ? "/register/donor" : "/register/hospital")} className="text-xs text-secondary font-semibold">ثبت‌نام جدید</button>
          <button onClick={() => { setShowForgot(true); setForgotUsername(""); setFoundPassword(null); }} className="text-xs text-primary font-semibold">فراموشی رمز عبور؟</button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700 leading-relaxed">{error}</p>
          </div>
        )}
        <button onClick={handleSubmit} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <LogIn size={17} />
          ورود به سامانه
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">یا ورود با</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button className="w-full border-2 border-border py-3.5 rounded-2xl font-bold text-xs text-foreground flex items-center justify-center gap-2">
          <Shield size={16} className="text-muted-foreground" />
          کد ملی + کد یکبار مصرف (OTP)
        </button>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2">
          <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 leading-relaxed">این سامانه توسط وزارت بهداشت تأیید و امنیت اطلاعات شما تضمین شده است.</p>
        </div>
      </div>
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={28} className="text-primary" /></div>
            <h3 className="text-base font-bold text-foreground mb-2">فراموشی رمز عبور</h3>
            <p className="text-xs text-muted-foreground mb-4">{activeType === "donor" ? "کد ملی خود را وارد کنید." : "کد بیمارستان را وارد کنید."}</p>
            <input type="text" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} placeholder={activeType === "donor" ? "1532620591" : "TEH-202D"} className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-sm outline-none text-center mb-4" style={{ direction: "ltr" }} />
            <button onClick={handleForgotLookup} disabled={!forgotUsername.trim()} className="w-full bg-primary text-white py-3 rounded-2xl text-sm font-bold mb-3">بازیابی رمز عبور</button>
            {foundPassword !== null && (
              <div className={`rounded-2xl p-3 text-sm font-bold ${foundPassword ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {foundPassword ? `رمز عبور شما: ${foundPassword}` : "کاربری با این مشخصات یافت نشد"}
              </div>
            )}
            <button onClick={() => setShowForgot(false)} className="mt-3 text-xs text-muted-foreground font-semibold">بستن</button>
          </div>
        </div>
      )}
    </div>
  );
};
