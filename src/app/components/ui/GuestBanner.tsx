export const GuestBanner = ({ onLogin }: { onLogin: () => void }) => (
  <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between flex-shrink-0" dir="rtl">
    <button onClick={onLogin} className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
      ورود / ثبت‌نام
    </button>
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-amber-700 font-semibold">حالت مهمان — دسترسی محدود</span>
      <div className="w-2 h-2 rounded-full bg-amber-400" />
    </div>
  </div>
);
