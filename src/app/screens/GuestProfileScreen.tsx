import { StatusBar } from "../components/ui/StatusBar";
import { User, LogIn, UserPlus, Info } from "lucide-react";

export const GuestProfileScreen = ({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    <div className="bg-white flex-shrink-0"><StatusBar /></div>
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 gap-5">
      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
        <User size={44} className="text-amber-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">کاربر مهمان</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">شما در حالت مرور بدون احراز هویت هستید. برای مشاهده پروفایل و استفاده از امکانات کامل، وارد شوید یا ثبت‌نام کنید.</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <button onClick={onLogin} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <LogIn size={18} />ورود به حساب کاربری
        </button>
        <button onClick={onRegister} className="w-full bg-secondary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
          <UserPlus size={18} />ثبت‌نام جدید
        </button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">این سامانه دولتی است. احراز هویت با کد ملی برای تمامی امکانات الزامی می‌باشد.</p>
        </div>
      </div>
    </div>
  </div>
);
