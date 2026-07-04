import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { getAppointmentsByHospital, confirmAppointment, rejectAppointment, cancelAppointment, completeAppointment, getAppointmentById } from "../services/appointmentStore";
import { getRequestById, updateRequest } from "../services/requestStore";
import { useAuth } from "../contexts/AuthContext";
import { getUserById, saveUser } from "../services/authStorage";
import { persianDateString } from "../lib/persian-calendar";
import type { Appointment, HospitalProfile, DonorProfile } from "../types";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, Trash2, Award } from "lucide-react";

interface Props { onBack: () => void }

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "در انتظار تأیید", color: "text-amber-700", bg: "bg-amber-50" },
  confirmed: { label: "تأیید شده", color: "text-green-700", bg: "bg-green-50" },
  completed: { label: "انجام شده", color: "text-blue-700", bg: "bg-blue-50" },
  cancelled: { label: "لغو شده", color: "text-red-700", bg: "bg-red-50" },
};

export const HospitalAppointmentsScreen = ({ onBack }: Props) => {
  const { user } = useAuth();
  const hospital = user as HospitalProfile | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"done" | "cancel" | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!hospital) return;
    setAppointments(getAppointmentsByHospital(hospital.username));
    const iv = setInterval(() => setAppointments(getAppointmentsByHospital(hospital.username)), 5000);
    return () => clearInterval(iv);
  }, [hospital]);

  const refresh = () => { if (hospital) setAppointments(getAppointmentsByHospital(hospital.username)); };

  const handleConfirm = (id: string) => {
    confirmAppointment(id);
    const apt = getAppointmentById(id);
    if (apt) {
      const req = getRequestById(apt.requestId);
      if (req && req.status === "active") {
        updateRequest(req.id, { status: "matched" });
      }
    }
    refresh();
  };

  const handleReject = (id: string) => {
    rejectAppointment(id);
    refresh();
  };

  const handleAction = () => {
    if (!actionId || !actionType) return;
    if (actionType === "done") {
      completeAppointment(actionId);
      const apt = getAppointmentById(actionId);
      if (apt) {
        const donor = getUserById(apt.donorId) as DonorProfile | null;
        if (donor) {
          const now = new Date();
          const next = new Date(now);
          next.setMonth(next.getMonth() + 3);
          saveUser({
            ...donor,
            donations: (donor.donations ?? 0) + 1,
            lastDonation: persianDateString(now),
            nextEligible: persianDateString(next),
            eligible: false,
          });
        }
        const req = getRequestById(apt.requestId);
        if (req) {
          const newMatched = (req.matched ?? 0) + 1;
          if (newMatched >= req.units) {
            updateRequest(req.id, { matched: newMatched, status: "completed" });
            const allApts = getAppointmentsByHospital(apt.hospitalId);
            allApts.filter((a) => a.requestId === req.id && a.id !== apt.id && (a.status === "pending" || a.status === "confirmed")).forEach((a) => cancelAppointment(a.id));
          } else {
            updateRequest(req.id, { matched: newMatched });
          }
        }
      }
    } else {
      cancelAppointment(actionId);
    }
    setActionId(null);
    setActionType(null);
    refresh();
  };

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const history = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0">
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <h1 className="text-lg font-bold text-foreground">نوبت‌های دریافتی</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {appointments.length === 0 ? (
          <div className="mx-4 mt-6 bg-white rounded-2xl p-8 shadow-sm border border-border/20 text-center">
            <Calendar size={40} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">نوبتی ثبت نشده است.</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mx-4 mt-4">
                <h2 className="text-sm font-bold text-foreground mb-3">نیاز به تأیید</h2>
                <div className="flex flex-col gap-3">
                  {pending.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20 border-amber-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/8 rounded-full flex items-center justify-center"><User size={18} className="text-primary" /></div>
                          <div><p className="text-sm font-bold text-foreground">{a.donorName}</p><p className="text-[11px] text-muted-foreground">{a.bloodType}</p></div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_LABELS[a.status].bg} ${STATUS_LABELS[a.status].color}`}>{STATUS_LABELS[a.status].label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                        <div className="flex items-center gap-1"><Calendar size={12} /><span>{a.date}</span></div>
                        <div className="flex items-center gap-1"><Clock size={12} /><span>{a.time}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleConfirm(a.id)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-[0.97] transition-transform"><CheckCircle size={13} />تأیید نوبت</button>
                        <button onClick={() => handleReject(a.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-[0.97] transition-transform"><XCircle size={13} />رد نوبت</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {confirmed.length > 0 && (
              <div className="mx-4 mt-5">
                <h2 className="text-sm font-bold text-foreground mb-3">تأیید شده ({confirmed.length})</h2>
                <div className="flex flex-col gap-3">
                  {confirmed.map((a) => (
                    <div key={a.id}>
                      <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border/20 text-right active:scale-[0.98] transition-transform">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/8 rounded-full flex items-center justify-center"><User size={18} className="text-primary" /></div>
                            <div><p className="text-sm font-bold text-foreground">{a.donorName}</p><p className="text-[11px] text-muted-foreground">{a.bloodType}</p></div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_LABELS[a.status].bg} ${STATUS_LABELS[a.status].color}`}>{STATUS_LABELS[a.status].label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar size={12} /><span>{a.date}</span></div>
                          <div className="flex items-center gap-1"><Clock size={12} /><span>{a.time}</span></div>
                        </div>
                      </button>
                      {expandedId === a.id && (
                        <div className="bg-primary/5 rounded-b-2xl px-4 pb-4 -mt-2 border border-primary/10 border-t-0">
                          <div className="flex gap-2 pt-3">
                            <button onClick={() => { setActionId(a.id); setActionType("done"); }} className="flex-1 bg-green-500 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-[0.97] transition-transform"><Award size={14} />ثبت اهدا</button>
                            <button onClick={() => { setActionId(a.id); setActionType("cancel"); }} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.97] transition-transform"><XCircle size={14} />لغو نوبت</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="mx-4 mt-5">
                <h2 className="text-sm font-bold text-foreground mb-3">تاریخچه</h2>
                <div className="flex flex-col gap-2.5">
                  {history.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-border/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/8 rounded-full flex items-center justify-center"><User size={16} className="text-primary" /></div>
                        <div><p className="text-sm font-semibold text-foreground">{a.donorName}</p><p className="text-[10px] text-muted-foreground">{a.date} • {a.time}</p></div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_LABELS[a.status].bg} ${STATUS_LABELS[a.status].color}`}>{STATUS_LABELS[a.status].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {actionId && actionType && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className={`w-16 h-16 ${actionType === "done" ? "bg-green-50" : "bg-red-50"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {actionType === "done" ? <CheckCircle size={28} className="text-green-500" /> : <Trash2 size={28} className="text-red-500" />}
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              {actionType === "done" ? "ثبت اهدا" : "لغو نوبت"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {actionType === "done" ? "آیا اهدای خون توسط این شخص انجام شده است؟ با تأیید، تایمر ۳ ماهه برای اهدای بعدی فعال می‌شود." : "آیا از لغو این نوبت اطمینان دارید؟"}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setActionId(null); setActionType(null); }} className="flex-1 bg-muted text-muted-foreground py-3 rounded-2xl text-sm font-bold">انصراف</button>
              <button onClick={handleAction} className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white ${actionType === "done" ? "bg-green-500" : "bg-red-500"}`}>
                {actionType === "done" ? "ثبت اهدا" : "تأیید لغو"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
