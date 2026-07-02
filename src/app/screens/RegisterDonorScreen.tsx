import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { StatusBar } from "../components/ui/StatusBar";
import { StepIndicator } from "../components/ui/StepIndicator";
import { BLOOD_TYPES, PROVINCES, getCitiesByProvince } from "../data/constants";
import { findDonorInRegistry } from "../services/registryDb";
import { usernameExists } from "../services/authStorage";
import { ArrowLeft, Droplets, Shield, CheckCircle, Phone, Lock, User, Calendar, ChevronDown, AlertCircle, EyeOff, Eye, CalendarDays } from "lucide-react";
import { PersianCalendar } from "../components/ui/PersianCalendar";
import { toPersianDigits } from "../lib/persian-calendar";

export const RegisterDonorScreen = () => {
  const { registerDonor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [bloodType, setBloodType] = useState("O+");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [hasDiseases, setHasDiseases] = useState(false);
  const [diseaseName, setDiseaseName] = useState("");
  const [takesMeds, setTakesMeds] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showBirthCalendar, setShowBirthCalendar] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [province, setProvince] = useState("تهران");
  const [city, setCity] = useState("تهران");
  const [weight, setWeight] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [address, setAddress] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const totalSteps = 4;
  const stepLabels = ["احراز هویت", "اطلاعات شخصی", "اطلاعات پزشکی", "رمز عبور"];

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleVerify = () => {
    if (!nationalId.trim() || nationalId.trim().length !== 10) {
      setRegisterError("لطفاً کد ملی ۱۰ رقمی را وارد کنید.");
      return;
    }
    if (!birthYear || !birthMonth || !birthDay) {
      setRegisterError("لطفاً تاریخ تولد خود را کامل وارد کنید.");
      return;
    }
    if (usernameExists(nationalId.trim())) {
      setRegisterError("این کد ملی قبلاً ثبت‌نام شده است. لطفاً وارد حساب خود شوید.");
      return;
    }
    const birthDate = `${birthYear}/${birthMonth}/${birthDay}`;
    const found = findDonorInRegistry(nationalId, birthDate);
    if (!found) {
      setRegisterError("کد ملی یا تاریخ تولد در سامانه ثبت احوال یافت نشد. اطلاعات وارد شده را بررسی کنید.");
      return;
    }
    setRegisterError("");
    setVerified(true);
    setFirstName(found.firstName);
    setLastName(found.lastName);
    setGender(found.gender || "male");
    if (!phone) setPhone(found.phone || "");
  };

  const handleComplete = () => {
    if (password.length < 8) { setRegisterError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }
    if (password !== confirmPassword) { setRegisterError("رمز عبور و تکرار آن مطابقت ندارند."); return; }
    const result = registerDonor({
      nationalId: nationalId.trim(),
      phone: phone.trim(),
      firstName,
      lastName,
      province,
      city,
      address: address.trim(),
      bloodType,
      weight,
      height,
      gender,
      password,
      diseaseName: hasDiseases ? diseaseName : undefined,
      medicationName: takesMeds ? medicationName : undefined,
    });
    if (!result.success) setRegisterError(result.error ?? "خطا در ثبت‌نام");
    else navigate("/app", { replace: true });
  };

  const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="bg-white border-b border-border/30 flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-1 pb-4">
        <button onClick={step === 1 ? () => navigate("/") : () => setStep(s => s - 1)} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={18} className="text-foreground rotate-180" />
        </button>
        <div className="flex-1 text-right">
          <h1 className="text-base font-bold text-foreground">{title}</h1>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
          <Droplets size={18} className="text-primary" />
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header title="ثبت‌نام اهداکننده" subtitle="مرحله ۱ از ۴ — احراز هویت" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-800 mb-0.5">احراز هویت از سامانه ثبت احوال</p>
            <p className="text-[11px] text-blue-700 leading-relaxed">اطلاعات هویتی شما از طریق سامانه ملی ثبت احوال تأیید می‌شود. لطفاً اطلاعات دقیق وارد کنید.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">کد ملی <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <Shield size={16} className="text-muted-foreground flex-shrink-0" />
              <input type="text" maxLength={10} value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))} placeholder="0012345678" className="flex-1 bg-transparent text-sm outline-none tracking-widest" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">۱۰ رقم بدون خط تیره</p>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">تاریخ تولد (شمسی) <span className="text-primary">*</span></label>
            <button onClick={() => setShowBirthCalendar(true)} className="w-full flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-right">
              <CalendarDays size={16} className="text-muted-foreground flex-shrink-0" />
              <span className={`flex-1 text-sm ${birthYear ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                {birthYear ? `${birthYear}/${birthMonth}/${birthDay}` : "انتخاب تاریخ تولد"}
              </span>
            </button>
            {showBirthCalendar && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border/20">
                    <h3 className="text-sm font-bold text-foreground">انتخاب تاریخ تولد</h3>
                    <button onClick={() => setShowBirthCalendar(false)} className="text-xs text-muted-foreground font-semibold">بستن</button>
                  </div>
                  <div className="p-4">
                    <PersianCalendar
                      selectedDate={birthYear ? `${birthYear}/${birthMonth}/${birthDay}` : ""}
                      onSelect={(date) => {
                        const parts = date.split("/");
                        setBirthYear(parts[0]);
                        setBirthMonth(parts[1]);
                        setBirthDay(parts[2]);
                        setShowBirthCalendar(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {registerError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mt-4 mb-1 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700">{registerError}</p>
          </div>
        )}
        {!verified ? (
          <button onClick={handleVerify} className="w-full mt-5 bg-secondary text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
            <Shield size={16} />استعلام و تأیید هویت
          </button>
        ) : (
          <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">هویت تأیید شد</p>
              <p className="text-[11px] text-green-700">{firstName} {lastName} — کد ملی {nationalId}</p>
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        <button onClick={() => setStep(2)} disabled={!verified} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${verified ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
          مرحله بعد
        </button>
      </div>
    </div>
  );

  const handleStep2 = () => {
    if (!gender) { setRegisterError("لطفاً جنسیت خود را انتخاب کنید."); return; }
    if (!province) { setRegisterError("لطفاً استان خود را انتخاب کنید."); return; }
    if (!city) { setRegisterError("لطفاً شهر خود را انتخاب کنید."); return; }
    if (!address.trim()) { setRegisterError("لطفاً آدرس خود را وارد کنید."); return; }
    setRegisterError("");
    setStep(3);
  };

  if (step === 2) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header title="ثبت‌نام اهداکننده" subtitle="مرحله ۲ از ۴ — اطلاعات شخصی" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-5 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-[11px] text-green-700">اطلاعات زیر از سامانه ثبت احوال دریافت شد و قابل ویرایش نیست.</p>
        </div>
        <div className="flex flex-col gap-4">
          {[{ label: "نام", value: firstName, readonly: true }, { label: "نام خانوادگی", value: lastName, readonly: true }].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold text-foreground mb-2 block">{f.label} <span className="text-primary">*</span></label>
              <div className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border ${f.readonly ? "bg-green-50/50 border-green-200" : "bg-muted/60 border-border"}`}>
                {f.readonly && <Lock size={14} className="text-green-500 flex-shrink-0" />}
                <span className="flex-1 text-sm text-foreground text-right">{f.value}</span>
              </div>
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">جنسیت <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border bg-green-50/50 border-green-200">
              <Lock size={14} className="text-green-500 flex-shrink-0" />
              <span className="flex-1 text-sm text-foreground text-right">{gender === "male" ? "مرد" : "زن"}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">استان <span className="text-primary">*</span></label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-sm outline-none text-foreground appearance-none" style={{ direction: "rtl" }}>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">شهر <span className="text-primary">*</span></label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-sm outline-none text-foreground appearance-none" style={{ direction: "rtl" }}>
              {getCitiesByProvince(province).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">شماره موبایل <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <Phone size={16} className="text-muted-foreground flex-shrink-0" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121234567" className="flex-1 bg-transparent text-sm outline-none" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">آدرس <span className="text-primary">*</span></label>
            <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="خیابان، کوچه، پلاک..." className="w-full bg-muted/60 rounded-2xl px-4 py-3 border border-border text-sm outline-none text-right resize-none placeholder:text-muted-foreground/60" style={{ direction: "rtl" }} />
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
    if (!weight || weight < 30) { setRegisterError("لطفاً وزن خود را وارد کنید (حداقل ۳۰ کیلوگرم)."); return; }
    if (!height || height < 50) { setRegisterError("لطفاً قد خود را وارد کنید."); return; }
    setRegisterError("");
    setStep(4);
  };

  if (step === 3) return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header title="ثبت‌نام اهداکننده" subtitle="مرحله ۳ از ۴ — اطلاعات پزشکی" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-foreground mb-3 block">گروه خونی <span className="text-primary">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map((t) => (
                <button key={t} onClick={() => setBloodType(t)} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${bloodType === t ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground mb-2 block">وزن (کیلوگرم) <span className="text-primary">*</span></label>
              <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
                <input type="number" value={weight ?? ""} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)} placeholder="۷۵" className="w-full bg-transparent text-sm outline-none text-center placeholder:text-muted-foreground/60" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground mb-2 block">قد (سانتیمتر) <span className="text-primary">*</span></label>
              <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
                <input type="number" value={height ?? ""} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)} placeholder="۱۷۵" className="w-full bg-transparent text-sm outline-none text-center placeholder:text-muted-foreground/60" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">آیا بیماری خاص دارید؟ <span className="text-primary">*</span></label>
            <div className="flex gap-3">
              <button onClick={() => { setHasDiseases(false); setDiseaseName(""); }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${!hasDiseases ? "bg-green-500 text-white border-green-500" : "bg-white text-foreground border-border"}`}>خیر</button>
              <button onClick={() => setHasDiseases(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${hasDiseases ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>بله</button>
            </div>
            {hasDiseases && (
              <div className="mt-2 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
                <input type="text" value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} placeholder="نام بیماری" className="w-full bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/60" />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">آیا دارو مصرف می‌کنید؟ <span className="text-primary">*</span></label>
            <div className="flex gap-3">
              <button onClick={() => { setTakesMeds(false); setMedicationName(""); }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${!takesMeds ? "bg-green-500 text-white border-green-500" : "bg-white text-foreground border-border"}`}>خیر</button>
              <button onClick={() => setTakesMeds(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${takesMeds ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>بله</button>
            </div>
            {takesMeds && (
              <div className="mt-2 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
                <input type="text" value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="نام دارو" className="w-full bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/60" />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">آخرین اهدای خون (در صورت وجود)</label>
            <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border flex items-center gap-3">
              <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
              <input type="text" placeholder="۱۴۰۳/۰۱/۱۵ یا اولین بار" className="flex-1 bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/50" />
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
        <button onClick={handleStep3} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">مرحله بعد</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header title="ثبت‌نام اهداکننده" subtitle="مرحله ۴ از ۴ — رمز عبور" />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIndicator current={4} total={totalSteps} labels={stepLabels} />
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">رمز عبور <span className="text-primary">*</span></label>
            <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3.5 border border-border">
              <button onClick={() => setShowPass(!showPass)} className="flex-shrink-0">
                {showPass ? <EyeOff size={15} className="text-muted-foreground" /> : <Eye size={15} className="text-muted-foreground" />}
              </button>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۸ کاراکتر" className="flex-1 bg-transparent text-sm outline-none" style={{ direction: "ltr", textAlign: "right" }} />
            </div>
            <div className="flex gap-1 mt-2">
              {[4, 3, 2, 1].map((level) => (
                <div key={level} className={`flex-1 h-1 rounded-full ${password.length >= level * 2 ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">قدرت رمز: {password.length < 4 ? "ضعیف" : password.length < 8 ? "متوسط" : "قوی"}</p>
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
            <p className="text-xs font-bold text-foreground mb-1">تأیید شماره موبایل</p>
            <p className="text-[11px] text-muted-foreground mb-3">{otpVerified ? "✓ شماره موبایل تأیید شد" : "یک کد ۶ رقمی به شماره موبایل شما ارسال می‌شود."}</p>
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
              <span className="text-primary font-bold">قوانین و مقررات سامانه ملی اهدای خون</span> و <span className="text-primary font-bold">سیاست حفظ حریم خصوصی</span> وزارت بهداشت را خوانده‌ام و می‌پذیرم.
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
          تکمیل ثبت‌نام
        </button>
      </div>
    </div>
  );
};
