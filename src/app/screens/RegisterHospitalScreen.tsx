import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { StatusBar } from "../components/ui/StatusBar";
import { StepIndicator } from "../components/ui/StepIndicator";
import { HOSPITAL_TYPES } from "../data/constants";
import { findHospitalInRegistry } from "../services/registryDb";
import { usernameExists } from "../services/authStorage";
import { ArrowLeft, Building2, FileText, Shield, CheckCircle, ChevronDown, Info, AlertCircle, EyeOff, Eye, Lock } from "lucide-react";

export const RegisterHospitalScreen = () => {
  const { registerHospital, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [hospitalType, setHospitalType] = useState("دولتی");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [province, setProvince] = useState("تهران");
  const [city, setCity] = useState("تهران");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [managerFirstName, setManagerFirstName] = useState("");
  const [managerLastName, setManagerLastName] = useState("");
  const [managerNationalId, setManagerNationalId] = useState("");
  const [managerPosition, setManagerPosition] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const totalSteps = 4;
  const stepLabels = ["اطلاعات بیمارستان", "اطلاعات تماس", "مدیر مسئول", "رمز و تأیید"];

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleVerify = () => {
    if (!hospitalId.trim()) {
      setRegisterError("لطفاً کد بیمارستان را وارد کنید.");
      return;
    }
    if (usernameExists(hospitalId.trim())) {
      setRegisterError("این کد بیمارستان قبلاً ثبت‌نام شده است. لطفاً وارد حساب خود شوید.");
      return;
    }
    const found = findHospitalInRegistry(hospitalId);
    if (!found) {
      setRegisterError("کد بیمارستان در سامانه وزارت بهداشت یافت نشد. لطفاً کد را بررسی کنید.");
      return;
    }
    setRegisterError("");
    setVerified(true);
    setHospitalName(found.name);
    setLicenseNumber(found.licenseNumber);
    if (!city || city === "تهران") setCity(found.city);
    if (!province || province === "تهران") setProvince(found.province);
    if (!address) setAddress(found.address || "");
  };

  const handleComplete = () => {
    if (!address.trim()) { setRegisterError("لطفاً آدرس کامل را وارد کنید."); return; }
    if (!phone.trim()) { setRegisterError("لطفاً شماره تلفن بیمارستان را وارد کنید."); return; }
    if (password.length < 8) { setRegisterError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }
    if (password !== confirmPassword) { setRegisterError("رمز عبور و تکرار آن مطابقت ندارند."); return; }
    const result = registerHospital({
      hospitalId: hospitalId.trim(),
      name: hospitalName,
      hospitalType,
      province,
      city,
      address,
      phone,
      licenseNumber: licenseNumber.trim(),
      managerFirstName: managerFirstName.trim(),
      managerLastName: managerLastName.trim(),
      managerNationalId: managerNationalId.trim(),
      managerPosition: managerPosition.trim(),
      managerPhone: managerPhone.trim(),
      password,
    });
    if (!result.success) setRegisterError(result.error ?? "خطا در ثبت‌نام");
    else navigate("/app", { replace: true });
  };

  const Header = ({ subtitle }: { subtitle: string }) => (
    <div className="bg-white border-b border-border/30 flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-1 pb-4">
        <button onClick={step === 1 ? () => navigate("/") : () => setStep(s => s - 1)} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={18} className="text-foreground rotate-180" />
        </button>
        <div className="flex-1 text-right">
          <h1 className="text-base font-bold text-foreground">ثبت‌نام بیمارستان</h1>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-secondary" />
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header subtitle="مرحله ۱ از ۴ — مشخصات بیمارستان" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="bg-secondary/8 border border-secondary/20 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <Building2 size={16} className="text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground leading-relaxed">مشخصات بیمارستان از سامانه وزارت بهداشت استعلام می‌شود. کد بیمارستان روی مجوز فعالیت درج شده است.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">کد بیمارستان (کد شناسه) <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <FileText size={16} className="text-muted-foreground flex-shrink-0" />
              <input type="text" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} placeholder="TEH-202D" className="flex-1 bg-transparent text-sm outline-none tracking-widest" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">نوع بیمارستان <span className="text-primary">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {HOSPITAL_TYPES.map((t) => (
                <button key={t} onClick={() => setHospitalType(t)} className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${hospitalType === t ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">شماره مجوز وزارت بهداشت <span className="text-primary">*</span></label>
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border ${verified ? "bg-green-50/50 border-green-200" : "bg-muted/60 border-border"}`}>
              {verified && <Shield size={14} className="text-green-500 flex-shrink-0" />}
              <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="IR-MOH-XXXX-YYYY" disabled={verified} className={`w-full bg-transparent text-sm outline-none ${verified ? "text-green-800 font-medium" : ""}`} style={{ direction: "ltr" }} />
            </div>
            {verified && <p className="text-[10px] text-green-600 mt-1">✓ تأیید شده از سامانه وزارت بهداشت</p>}
          </div>
          {registerError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mt-4 mb-1 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700">{registerError}</p>
            </div>
          )}
          {!verified ? (
            <button onClick={handleVerify} className="w-full mt-1 bg-secondary text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              <Shield size={16} />استعلام و تأیید مجوز
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">مجوز تأیید شد</p>
                <p className="text-[11px] text-green-700">{hospitalName} — {city}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        <button onClick={() => setStep(2)} disabled={!verified} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${verified ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}>مرحله بعد</button>
      </div>
    </div>
  );

  const handleStep2 = () => {
    if (!address.trim()) { setRegisterError("لطفاً آدرس کامل را وارد کنید."); return; }
    if (!phone.trim()) { setRegisterError("لطفاً شماره تلفن بیمارستان را وارد کنید."); return; }
    setRegisterError("");
    setStep(3);
  };

  if (step === 2) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header subtitle="مرحله ۲ از ۴ — اطلاعات تماس" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-[11px] text-green-700">نام بیمارستان از سامانه تأیید شده است: {hospitalName}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">آدرس کامل <span className="text-primary">*</span></label>
            <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="خیابان، کوچه، پلاک..." className="w-full bg-muted/60 rounded-2xl px-4 py-3 border border-border text-sm outline-none text-right resize-none placeholder:text-muted-foreground/50" style={{ direction: "rtl" }} />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">شماره تلفن بیمارستان <span className="text-primary">*</span></label>
            <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="021-12345678" className="w-full bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/50" style={{ direction: "ltr" }} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground mb-2 block">استان <span className="text-primary">*</span></label>
              <div className="bg-green-50/50 border border-green-200 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Lock size={14} className="text-green-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground text-right">{province}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground mb-2 block">شهر <span className="text-primary">*</span></label>
              <div className="bg-green-50/50 border border-green-200 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Lock size={14} className="text-green-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground text-right">{city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        {registerError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700">{registerError}</p>
          </div>
        )}
        <button onClick={handleStep2} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">مرحله بعد</button>
      </div>
    </div>
  );

  const handleStep3 = () => {
    if (!managerFirstName.trim()) { setRegisterError("لطفاً نام مدیر مسئول را وارد کنید."); return; }
    if (!managerLastName.trim()) { setRegisterError("لطفاً نام خانوادگی مدیر مسئول را وارد کنید."); return; }
    if (!managerNationalId.trim() || managerNationalId.trim().length !== 10) { setRegisterError("لطفاً کد ملی ۱۰ رقمی مدیر را وارد کنید."); return; }
    if (!managerPosition.trim()) { setRegisterError("لطفاً سمت مدیر را وارد کنید."); return; }
    if (!managerPhone.trim()) { setRegisterError("لطفاً شماره تماس مستقیم مدیر را وارد کنید."); return; }
    setRegisterError("");
    setStep(4);
  };

  if (step === 3) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header subtitle="مرحله ۳ از ۴ — مدیر مسئول" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-start gap-2">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">اطلاعات مدیر مسئول باید با اطلاعات ثبت شده در وزارت بهداشت مطابقت داشته باشد.</p>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { label: "نام مدیر مسئول", ph: "نام", state: managerFirstName, setter: setManagerFirstName },
            { label: "نام خانوادگی", ph: "نام خانوادگی", state: managerLastName, setter: setManagerLastName },
            { label: "کد ملی مدیر", ph: "0012345678", state: managerNationalId, setter: setManagerNationalId },
            { label: "سمت", ph: "مثال: مدیر عامل، رئیس بیمارستان", state: managerPosition, setter: setManagerPosition },
            { label: "شماره تماس مستقیم", ph: "09121234567", state: managerPhone, setter: setManagerPhone },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold text-foreground mb-2 block">{f.label} <span className="text-primary">*</span></label>
              <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
                <input type="text" value={f.state} onChange={(e) => f.setter(e.target.value)} placeholder={f.ph} className="w-full bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        {registerError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700">{registerError}</p>
          </div>
        )}
        <button onClick={handleStep3} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">مرحله بعد</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header subtitle="مرحله ۴ از ۴ — رمز و تأیید" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={4} total={totalSteps} labels={stepLabels} />
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">رمز عبور سامانه <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <button onClick={() => setShowPass(!showPass)} className="flex-shrink-0">
                {showPass ? <EyeOff size={15} className="text-muted-foreground" /> : <Eye size={15} className="text-muted-foreground" />}
              </button>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۱۲ کاراکتر" className="flex-1 bg-transparent text-sm outline-none" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">تکرار رمز عبور <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="flex-shrink-0">
                {showConfirmPass ? <EyeOff size={15} className="text-muted-foreground" /> : <Eye size={15} className="text-muted-foreground" />}
              </button>
              <input type={showConfirmPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent text-sm outline-none" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
          </div>
          <div className="bg-muted/60 rounded-2xl p-4">
            <p className="text-xs font-bold text-foreground mb-2">{otpVerified ? "✓ شماره تماس تأیید شد" : "تأیید شماره تماس مدیر"}</p>
            <div className="flex gap-2">
              <button onClick={() => { setOtpSent(true); setOtpVerified(false); setOtpCode(""); }} disabled={otpSent && !otpVerified} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${otpVerified ? "bg-green-50 text-green-700" : "bg-secondary text-white"}`}>{otpVerified ? "✓ تأیید شد" : otpSent ? "ارسال مجدد" : "ارسال کد تأیید"}</button>
              {!otpVerified && (
                <div className="flex-1 bg-white rounded-xl border border-border px-3 py-2.5">
                  <input type="text" value={otpCode} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setOtpCode(v); if (v.length === 6 && otpSent) setOtpVerified(true); }} placeholder="کد ۶ رقمی" maxLength={6} className="w-full bg-transparent text-sm outline-none text-center tracking-widest placeholder:text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setAcceptTerms(!acceptTerms)} className="flex items-start gap-3 text-right">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${acceptTerms ? "bg-primary border-primary" : "border-border"}`}>
              {acceptTerms && <CheckCircle size={12} className="text-white" />}
            </div>
            <p className="text-xs text-foreground leading-relaxed flex-1">
              <span className="text-primary font-bold">قوانین استفاده از سامانه ملی اهدای خون</span> و <span className="text-primary font-bold">آیین‌نامه بیمارستان‌های عضو</span> وزارت بهداشت را خوانده‌ام و می‌پذیرم.
            </p>
          </button>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        {registerError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700">{registerError}</p>
          </div>
        )}
        <button onClick={handleComplete} disabled={!acceptTerms} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${acceptTerms ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
          تکمیل ثبت‌نام و ورود به سامانه
        </button>
      </div>
    </div>
  );
};
