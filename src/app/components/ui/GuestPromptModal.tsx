import { X, Lock, LogIn, UserPlus } from "lucide-react";

export const GuestPromptModal = ({ onLogin, onRegister, onClose }: { onLogin: () => void; onRegister: () => void; onClose: () => void }) => (
  <div className="absolute inset-0 z-50 flex items-end" dir="rtl" style={{ background: "rgba(13,27,62,0.45)" }} onClick={onClose}>
    <div className="w-full bg-white rounded-t-3xl px-6 pt-5 pb-8" onClick={(e) => e.stopPropagation()}>
      <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="w-8 h-8 bg-muted/60 rounded-full flex items-center justify-center">
          <X size={16} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-bold text-muted-foreground">نیاز به احراز هویت</span>
      </div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock size={28} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1.5">ورود مورد نیاز است</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">برای استفاده از این بخش باید وارد حساب کاربری خود شوید. به عنوان کاربر دولتی، احراز هویت الزامی است.</p>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onLogin} className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <LogIn size={18} />
          ورود به حساب کاربری
        </button>
        <button onClick={onRegister} className="w-full bg-secondary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
          <UserPlus size={18} />
          ثبت‌نام جدید
        </button>
        <button onClick={onClose} className="w-full text-muted-foreground text-sm py-2 font-medium">
          بازگشت به مرور
        </button>
      </div>
    </div>
  </div>
);
