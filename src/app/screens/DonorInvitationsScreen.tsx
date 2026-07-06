import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { getDonorInvitations, acceptInvitation, declineInvitation } from "../services/appointmentStore";
import { ArrowLeft, Check, X, Calendar, Clock, Building2, Loader, CheckCircle, XCircle, AlertCircle, MessageCircle } from "lucide-react";
import type { Appointment } from "../types";

interface Props {
  donorId: string;
  onBack: () => void;
  onChat: (convId: string) => void;
  onMyAppointments?: () => void;
}

export const DonorInvitationsScreen = ({ donorId, onBack, onChat, onMyAppointments }: Props) => {
  const [invitations, setInvitations] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const refresh = async () => {
    const invs = await getDonorInvitations(donorId);
    setInvitations(invs);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [donorId]);

  const handleAccept = async (id: string) => {
    setResponding(id);
    const ok = await acceptInvitation(id);
    setResponding(null);
    if (ok) {
      setDoneMsg("دعوتنامه با موفقیت تأیید شد. نوبت شما در «نوبت‌های من» ثبت شد.");
      refresh();
      setTimeout(() => setDoneMsg(null), 3000);
    }
  };

  const handleDecline = async (id: string) => {
    setResponding(id);
    const ok = await declineInvitation(id);
    setResponding(null);
    if (ok) {
      setDoneMsg("دعوتنامه رد شد.");
      refresh();
      setTimeout(() => setDoneMsg(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0 px-5 pt-2 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={19} className="text-foreground rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground">دعوتنامه‌های بیمارستان‌ها</h1>
        </div>
        <p className="text-[11px] text-muted-foreground">بیمارستان‌ها می‌توانند از شما برای اهدای خون دعوت کنند.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {doneMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700">{doneMsg}</span>
            </div>
            {onMyAppointments && (
              <button onClick={onMyAppointments} className="w-full bg-green-600 text-white py-2 rounded-xl text-xs font-bold mt-1">
                رفتن به نوبت‌های من
              </button>
            )}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-primary" /></div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/20 text-center mt-8">
            <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={30} className="text-muted-foreground/60" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">دعوتنامه‌ای ندارید</p>
            <p className="text-[11px] text-muted-foreground">هیچ بیمارستانی هنوز از شما دعوت نکرده است.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{inv.hospitalName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-black text-xs">{inv.bloodType}</span>
                        <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">نیاز به اهدا</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={12} />{inv.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{inv.time}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(inv.id)} disabled={responding === inv.id}
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {responding === inv.id ? <Loader size={14} className="animate-spin" /> : <Check size={15} />}
                    تأیید و پذیرش
                  </button>
                  <button onClick={() => handleDecline(inv.id)} disabled={responding === inv.id}
                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
                    <X size={15} />رد دعوت
                  </button>
                  <button onClick={() => onChat(inv.id)}
                    className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={17} className="text-muted-foreground" />
                  </button>
                </div>
                {inv.initiator === "hospital" && (
                  <div className="mt-2 flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-1.5">
                    <AlertCircle size={11} className="text-blue-500" />
                    <span className="text-[10px] text-blue-700">این دعوتنامه توسط بیمارستان برای شما ارسال شده است.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
