import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { getAppointmentsByDonor, cancelAppointment } from "../services/appointmentStore";
import { useAuth } from "../contexts/AuthContext";
import type { Appointment, DonorProfile } from "../types";
import { ArrowLeft, Calendar, Clock, Building2, XCircle, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface Props { onBack: () => void }

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "در انتظار تأیید", color: "text-amber-700", bg: "bg-amber-50" },
  confirmed: { label: "تأیید شده", color: "text-green-700", bg: "bg-green-50" },
  completed: { label: "انجام شده", color: "text-blue-700", bg: "bg-blue-50" },
  cancelled: { label: "لغو شده", color: "text-red-700", bg: "bg-red-50" },
};

export const MyAppointmentsScreen = ({ onBack }: Props) => {
  const { user } = useAuth();
  const donor = user as DonorProfile | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (!donor) return;
    setAppointments(getAppointmentsByDonor(donor.id));
    const iv = setInterval(() => setAppointments(getAppointmentsByDonor(donor.id)), 5000);
    return () => clearInterval(iv);
  }, [donor]);

  const handleCancel = () => {
    if (!cancelId) return;
    cancelAppointment(cancelId);
    setCancelId(null);
    if (donor) setAppointments(getAppointmentsByDonor(donor.id));
  };

  const active = appointments.filter((a) => a.status !== "cancelled" && a.status !== "completed");
  const history = appointments.filter((a) => a.status === "cancelled" || a.status === "completed");

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0">
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <h1 className="text-lg font-bold text-foreground">نوبت‌های من</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {active.length === 0 && history.length === 0 ? (
          <div className="mx-4 mt-6 bg-white rounded-2xl p-8 shadow-sm border border-border/20 text-center">
            <Calendar size={40} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">نوبتی ثبت نشده است.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="mx-4 mt-4">
                <h2 className="text-sm font-bold text-foreground mb-3">نوبت‌های فعال</h2>
                <div className="flex flex-col gap-3">
                  {active.map((a) => {
                    const st = STATUS_LABELS[a.status];
                    return (
                      <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <BloodBadge type={a.bloodType} size="sm" />
                            <div><p className="text-sm font-bold text-foreground">{a.hospitalName}</p></div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                          <div className="flex items-center gap-1"><Calendar size={12} /><span>{a.date}</span></div>
                          <div className="flex items-center gap-1"><Clock size={12} /><span>{a.time}</span></div>
                        </div>
                        {a.status === "pending" || a.status === "confirmed" ? (
                          <button onClick={() => setCancelId(a.id)} className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><XCircle size={13} />لغو نوبت</button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="mx-4 mt-5">
                <h2 className="text-sm font-bold text-foreground mb-3">تاریخچه</h2>
                <div className="flex flex-col gap-2.5">
                  {history.map((a) => {
                    const st = STATUS_LABELS[a.status];
                    return (
                      <div key={a.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-border/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BloodBadge type={a.bloodType} size="sm" />
                          <div><p className="text-sm font-semibold text-foreground">{a.hospitalName}</p><p className="text-[10px] text-muted-foreground">{a.date} • {a.time}</p></div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {cancelId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={28} className="text-red-500" /></div>
            <h3 className="text-base font-bold text-foreground mb-2">لغو نوبت</h3>
            <p className="text-sm text-muted-foreground mb-6">آیا از لغو این نوبت اطمینان دارید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="flex-1 bg-muted text-muted-foreground py-3 rounded-2xl text-sm font-bold">انصراف</button>
              <button onClick={handleCancel} className="flex-1 bg-red-500 text-white py-3 rounded-2xl text-sm font-bold">تأیید لغو</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
