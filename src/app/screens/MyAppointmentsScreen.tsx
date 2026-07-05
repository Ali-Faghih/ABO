import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { getAppointmentsByDonor, cancelAppointment } from "../services/appointmentStore";
import { getConversationByRequestAndParticipants } from "../services/chatStore";
import { useAuth } from "../contexts/AuthContext";
import type { Appointment, DonorProfile } from "../types";
import { ArrowLeft, Calendar, Clock, Building2, XCircle, Trash2, CheckCircle, MessageCircle, Timer } from "lucide-react";

interface Props { onBack: () => void; onChat?: (convId: string) => void }

const TIMELINE: Record<string, { steps: { label: string; icon: string }[] }> = {
  pending: { steps: [{ label: "رزرو نوبت", icon: "📅" }, { label: "در انتظار تأیید", icon: "⏳" }, { label: "اهدای خون", icon: "🩸" }, { label: "تکمیل", icon: "✅" }] },
  confirmed: { steps: [{ label: "رزرو نوبت", icon: "📅" }, { label: "تأیید شده", icon: "✅" }, { label: "اهدای خون", icon: "🩸" }, { label: "تکمیل", icon: "✅" }] },
  completed: { steps: [{ label: "رزرو نوبت", icon: "📅" }, { label: "تأیید شده", icon: "✅" }, { label: "اهدای خون", icon: "🩸" }, { label: "تکمیل", icon: "✅" }] },
  cancelled: { steps: [{ label: "رزرو نوبت", icon: "📅" }, { label: "لغو شده", icon: "❌" }, { label: "اهدای خون", icon: "🩸" }, { label: "تکمیل", icon: "✅" }] },
};

function timeSince(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const persianMonths: Record<string, number> = { "فروردین": 1, "اردیبهشت": 2, "خرداد": 3, "تیر": 4, "مرداد": 5, "شهریور": 6, "مهر": 7, "آبان": 8, "آذر": 9, "دی": 10, "بهمن": 11, "اسفند": 12 };
  try {
    const month = persianMonths[parts[1]] || parseInt(parts[1]);
    const d = new Date(parseInt(parts[0]) - 621, month - 1, parseInt(parts[2]));
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "چند لحظه پیش";
    if (hours < 24) return `${hours} ساعت پیش`;
    const days = Math.floor(hours / 24);
    return `${days} روز پیش`;
  } catch { return ""; }
}

export const MyAppointmentsScreen = ({ onBack, onChat }: Props) => {
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

  const handleChat = (a: Appointment) => {
    if (!donor) return;
    const conv = getConversationByRequestAndParticipants(a.requestId, donor.id, a.hospitalId);
    if (conv) onChat?.(conv.id);
  };

  const active = appointments.filter((a) => a.status !== "cancelled" && a.status !== "completed");
  const history = appointments.filter((a) => a.status === "cancelled" || a.status === "completed");

  const currentStepIndex = (status: string) => status === "pending" ? 1 : status === "confirmed" ? 2 : status === "completed" ? 3 : 1;

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
                <div className="flex flex-col gap-4">
                  {active.map((a) => {
                    const steps = TIMELINE[a.status]?.steps ?? TIMELINE.pending.steps;
                    const currentIdx = currentStepIndex(a.status);
                    return (
                      <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <BloodBadge type={a.bloodType} size="sm" />
                            <div><p className="text-sm font-bold text-foreground">{a.hospitalName}</p><p className="text-[10px] text-muted-foreground">{a.date} • {a.time}</p></div>
                          </div>
                          <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{timeSince(a.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i <= currentIdx ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground"}`}>{step.icon}</div>
                              <span className={`text-[9px] ${i <= currentIdx ? "text-foreground font-semibold" : "text-muted-foreground"} text-center leading-tight`}>{step.label}</span>
                            </div>
                          ))}
                        </div>
                        {a.status === "pending" && (
                          <div className="bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-2 mb-2">
                            <Timer size={13} className="text-amber-600 flex-shrink-0" />
                            <p className="text-[10px] text-amber-700">منتظر تأیید بیمارستان... <span className="font-semibold">{timeSince(a.createdAt)}</span> در انتظارید</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {onChat && (a.status === "pending" || a.status === "confirmed") && (
                            <button onClick={() => handleChat(a)} className="flex-1 bg-primary/8 text-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><MessageCircle size={12} />پیام به بیمارستان</button>
                          )}
                          {(a.status === "pending" || a.status === "confirmed") && (
                            <button onClick={() => setCancelId(a.id)} className={`${onChat ? "flex-1" : "w-full"} bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1`}><XCircle size={12} />لغو نوبت</button>
                          )}
                        </div>
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
                  {history.sort((a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0).map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-border/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BloodBadge type={a.bloodType} size="sm" />
                        <div><p className="text-sm font-semibold text-foreground">{a.hospitalName}</p><p className="text-[10px] text-muted-foreground">{a.date} • {a.time}</p></div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${a.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{a.status === "completed" ? "انجام شده" : "لغو شده"}</span>
                    </div>
                  ))}
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