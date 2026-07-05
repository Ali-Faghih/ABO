import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { getRequestsByHospital, getAvailableDonors, updateRequest, cancelRequest } from "../services/requestStore";
import { getAppointmentsByHospital, cancelAppointment } from "../services/appointmentStore";
import { canDonateTo } from "../lib/bloodCompatibility";
import type { HospitalProfile, BloodRequest } from "../types";
import { Bell, AlertCircle, Users, Award, Plus, ChevronRight, Clock, Calendar, Edit3, ListChecks, Save, XCircle, AlertTriangle, Loader } from "lucide-react";

interface Props { hospital: HospitalProfile; onAddRequest: () => void; onAction: (fn: () => void) => void; onAppointments?: () => void; onNotifications?: () => void; onVolunteers?: () => void }

export const HospitalHomeScreen = ({ hospital, onAddRequest, onAction, onAppointments, onNotifications, onVolunteers }: Props) => {
  const [requests, setRequests] = useState(getRequestsByHospital(hospital.username));
  const [compatCounts, setCompatCounts] = useState<Record<string, number>>({});
  const [editReq, setEditReq] = useState<BloodRequest | null>(null);
  const [editUnits, setEditUnits] = useState(1);
  const [editUrgency, setEditUrgency] = useState<"فوری" | "معمولی">("معمولی");
  const [editDeadline, setEditDeadline] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; donor: string; visible: boolean } | null>(null);
  const prevPendingRef = { current: 0 };

  const activeReqs = requests.filter((r) => r.status === "active" || r.status === "matched");

  const refresh = () => {
    const reqs = getRequestsByHospital(hospital.username);
    setRequests(reqs);
    const donors = getAvailableDonors();
    const counts: Record<string, number> = {};
    reqs.forEach((r) => { counts[r.id] = donors.filter((d) => canDonateTo(d.bloodType, r.bloodType)).length; });
    setCompatCounts(counts);
    const pending = getAppointmentsByHospital(hospital.username).filter((a) => a.status === "pending");
    if (pending.length > prevPendingRef.current && prevPendingRef.current > 0) {
      const newest = pending[0];
      setToast({ message: "نوبت جدید دریافت شد", donor: newest.donorName, visible: true });
      setTimeout(() => setToast(null), 5000);
    }
    prevPendingRef.current = pending.length;
  };

  useEffect(() => { refresh(); const iv = setInterval(refresh, 5000); return () => clearInterval(iv); }, [hospital.username]);

  const openEdit = (req: BloodRequest) => {
    setEditReq(req);
    setEditUnits(req.units);
    setEditUrgency(req.urgency);
    setEditDeadline(req.deadline);
    setShowCancelConfirm(false);
  };

  const handleEditSave = () => {
    if (!editReq) return;
    updateRequest(editReq.id, { units: editUnits, urgency: editUrgency, deadline: editDeadline });
    setEditReq(null);
    refresh();
  };

  const handleEditCancel = () => {
    if (!editReq) return;
    const apts = getAppointmentsByHospital(hospital.username).filter((a) => a.requestId === editReq.id && (a.status === "pending" || a.status === "confirmed"));
    apts.forEach((a) => cancelAppointment(a.id));
    cancelRequest(editReq.id);
    setEditReq(null);
    refresh();
  };

  return (
  <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    {toast?.visible && (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 animate-slideDown max-w-[90vw]">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <p className="text-xs font-bold">{toast.message}: <span className="font-normal">{toast.donor}</span></p>
        <button onClick={() => setToast(null)} className="mr-2 opacity-70 hover:opacity-100"><XCircle size={14} /></button>
      </div>
    )}
    <div className="bg-white flex-shrink-0">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <span className="text-xs text-muted-foreground">پنل مدیریت</span>
          <div className="text-base font-bold text-foreground">{hospital.name}</div>
        </div>
        <button onClick={() => onAction(() => onNotifications?.())} className="relative w-9 h-9 bg-muted/70 rounded-full flex items-center justify-center">
          <Bell size={17} className="text-foreground" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2.5">
        {[
          { label: "درخواست فعال", value: String(activeReqs.length), icon: AlertCircle, c: "text-primary", bg: "bg-red-50" },
          { label: "داوطلبان", value: String(Object.values(compatCounts).reduce((s, c) => s + c, 0) > 0 ? Object.values(compatCounts).reduce((s, c) => s + c, 0) : getAvailableDonors().length), icon: Users, c: "text-blue-600", bg: "bg-blue-50" },
          { label: "کل اهداها", value: String(requests.filter((r) => r.status === "completed").length), icon: Award, c: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm border border-border/20">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}><s.icon size={15} className={s.c} /></div>
            <p className="text-xl font-black text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-4">
        <button onClick={() => onAction(onAddRequest)} className="w-full bg-primary rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Plus size={22} className="text-white" /></div>
          <div className="text-right flex-1">
            <p className="text-white font-bold text-sm">ایجاد درخواست خون</p>
            <p className="text-white/65 text-xs mt-0.5">یافتن اهداکنندگان مناسب</p>
          </div>
          <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
        </button>
        <button onClick={() => onAction(onVolunteers ?? (() => {}))} className="w-full mt-3 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-border/20 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><Users size={20} className="text-blue-600" /></div>
          <div className="text-right flex-1">
            <p className="text-foreground font-bold text-sm">لیست داوطلبان اهدا</p>
            <p className="text-muted-foreground/65 text-xs mt-0.5">مشاهده و ارتباط با اهداکنندگان آماده</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/60 flex-shrink-0" />
        </button>
        {onAppointments && (
          <button onClick={() => onAction(onAppointments)} className="w-full mt-3 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-border/20 active:scale-[0.98] transition-transform">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"><Calendar size={20} className="text-green-600" /></div>
            <div className="text-right flex-1">
              <p className="text-foreground font-bold text-sm">نوبت‌های دریافتی</p>
              <p className="text-muted-foreground/65 text-xs mt-0.5">مشاهده و مدیریت نوبت‌های اهداکنندگان</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground/60 flex-shrink-0" />
          </button>
        )}
      </div>
      <div className="mt-5 px-4">
        <h2 className="text-sm font-bold text-foreground mb-3">درخواست‌های فعال</h2>
        <div className="flex flex-col gap-2.5">
          {activeReqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/20 text-center">
              <p className="text-sm text-muted-foreground">درخواست فعالی وجود ندارد.</p>
            </div>
          ) : activeReqs.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center"><span className="text-primary font-black text-sm">{req.bloodType}</span></div>
                  <div><p className="text-sm font-bold text-foreground">{req.bloodType}</p><p className="text-[11px] text-muted-foreground">{req.units} واحد مورد نیاز</p></div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${req.urgency === "فوری" ? "bg-red-50 text-primary" : "bg-blue-50 text-blue-700"}`}>{req.urgency}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><Users size={11} />پیشرفت اهدا</span>
                  <span className="font-semibold text-foreground">{Math.min(req.matched, req.units)}/{req.units} واحد</span>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((req.matched / req.units) * 100, 100)}%`, background: req.matched >= req.units ? "var(--color-green-500)" : "linear-gradient(90deg, var(--color-primary), var(--color-primary)/70%)" }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1"><Clock size={11} /><span>مهلت: {req.deadline}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => onAction(onVolunteers ?? (() => {}))} className="relative flex-1 bg-primary/8 text-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.97] transition-transform">
                  <ListChecks size={12} />لیست داوطلبان
                  {(compatCounts[req.id] ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">{compatCounts[req.id]}</span>
                  )}
                </button>
                <button onClick={() => onAction(onAppointments ?? (() => {}))} className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.97] transition-transform"><Calendar size={12} />نوبت‌ها</button>
                <button onClick={() => openEdit(req)} className="flex-1 bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.97] transition-transform"><Edit3 size={12} />ویرایش</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {editReq && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setEditReq(null)}>
        <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-border/20 px-6 pt-4 pb-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-primary font-black text-sm">{editReq.bloodType}</span></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">ویرایش درخواست {editReq.bloodType}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{editReq.hospitalName}</p>
            </div>
            <button onClick={() => setEditReq(null)} className="w-8 h-8 bg-muted/60 rounded-full flex items-center justify-center flex-shrink-0"><XCircle size={15} className="text-muted-foreground" /></button>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">تعداد واحد مورد نیاز</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setEditUnits(Math.max(1, editUnits - 1))} className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center text-lg font-bold text-foreground">–</button>
                <span className="w-14 text-center text-2xl font-black text-foreground">{editUnits}</span>
                <button onClick={() => setEditUnits(Math.min(20, editUnits + 1))} className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center text-lg font-bold text-foreground">+</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">وضعیت فوریت</label>
              <div className="flex gap-2">
                {(["فوری", "معمولی"] as const).map((u) => (
                  <button key={u} onClick={() => setEditUrgency(u)} className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${editUrgency === u ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}>{u}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">مهلت درخواست</label>
              <input value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full bg-muted/40 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-colors" placeholder="مثال: ۱۴۰۴/۰۸/۱۵" />
            </div>
            <button onClick={handleEditSave} className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"><Save size={16} />ذخیره تغییرات</button>
            <div className="border-t border-border/20 pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center"><AlertTriangle size={16} className="text-red-500" /></div>
                <div><p className="text-sm font-bold text-foreground">حذف درخواست</p><p className="text-[10px] text-muted-foreground">نوبت‌های مرتبط نیز کنسل می‌شوند</p></div>
              </div>
              <button onClick={() => setShowCancelConfirm(true)} className="w-full bg-red-50 text-red-600 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"><XCircle size={14} />لغو درخواست</button>
            </div>
          </div>
        </div>
      </div>
    )}
    {showCancelConfirm && (
      <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6" onClick={() => setShowCancelConfirm(false)}>
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle size={32} className="text-red-500" /></div>
          <h3 className="text-base font-bold text-foreground mb-2">لغو درخواست</h3>
          <p className="text-sm text-muted-foreground mb-6">آیا از لغو این درخواست اطمینان دارید؟ تمام نوبت‌های مرتبط کنسل خواهد شد.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-muted text-muted-foreground py-3 rounded-2xl text-sm font-bold">انصراف</button>
            <button onClick={handleEditCancel} className="flex-1 bg-red-500 text-white py-3 rounded-2xl text-sm font-bold">تأیید لغو</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};