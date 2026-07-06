import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { inviteDonor, TIME_SLOTS, getBookedTimeSlots } from "../services/appointmentStore";
import { getActiveRequests } from "../services/requestStore";
import { ArrowLeft, Send, Calendar, Clock, AlertCircle, CheckCircle, Loader, User } from "lucide-react";
import type { BloodRequest } from "../types";

interface Props {
  donorId: string;
  donorName: string;
  donorBloodType: string;
  hospitalId: string;
  hospitalName: string;
  onBack: () => void;
}

export const SendInvitationScreen = ({ donorId, donorName, donorBloodType, hospitalId, hospitalName, onBack }: Props) => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useState(() => {
    (async () => {
      const reqs = (await getActiveRequests()).filter((r: any) => r.hospitalId === hospitalId);
      setRequests(reqs);
      setLoading(false);
    })();
  });

  const handleDateChange = async (d: string) => {
    setDate(d);
    if (d) {
      const slots = await getBookedTimeSlots(hospitalId, d);
      setBookedSlots(slots);
    } else {
      setBookedSlots([]);
    }
    setTime("");
  };

  const handleSubmit = async () => {
    if (!selectedRequest) { setError("لطفاً یک درخواست را انتخاب کنید."); return; }
    if (!date) { setError("لطفاً تاریخ را وارد کنید."); return; }
    if (!time) { setError("لطفاً ساعت را انتخاب کنید."); return; }
    setSending(true);
    setError("");
    const ok = await inviteDonor({
      requestId: selectedRequest,
      donorId,
      donorName,
      hospitalId,
      hospitalName,
      bloodType: donorBloodType,
      date,
      time,
    });
    setSending(false);
    if (ok) setDone(true);
    else setError("خطا در ارسال دعوتنامه. دوباره تلاش کنید.");
  };

  if (done) {
    return (
      <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
        <StatusBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/20 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">دعوتنامه ارسال شد</h2>
            <p className="text-sm text-muted-foreground mb-6">
              دعوتنامه برای {donorName} ارسال شد. پس از تأیید داوطلب، نوبت قطعی خواهد شد.
            </p>
            <button onClick={onBack} className="w-full bg-primary text-white py-3 rounded-2xl font-bold text-sm">
              بازگشت
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0 px-5 pt-2 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={19} className="text-foreground rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground">ارسال دعوتنامه</h1>
        </div>
        <div className="bg-primary/8 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/12 rounded-xl flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{donorName}</p>
            <p className="text-[11px] text-muted-foreground">گروه خونی: {donorBloodType}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-2 block">درخواست مرتبط</label>
              <div className="flex flex-col gap-2">
                {requests.map((req) => (
                  <button key={req.id} onClick={() => setSelectedRequest(req.id)}
                    className={`w-full text-right bg-white rounded-2xl p-3.5 border-2 transition-all ${
                      selectedRequest === req.id ? "border-primary bg-primary/5" : "border-border/20"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-black">{req.bloodType}</span>
                        <span className="text-xs text-muted-foreground">{req.urgency}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{req.units} واحد</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{req.notes || req.hospitalName}</p>
                  </button>
                ))}
                {requests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">هیچ درخواست فعالی یافت نشد.</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground mb-2 block">تاریخ</label>
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-border/20">
                <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
                <input type="text" value={date} onChange={(e) => handleDateChange(e.target.value)}
                  placeholder="۱۴۰۵/۰۴/۲۰" className="flex-1 bg-transparent text-sm outline-none text-right" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground mb-2 block">ساعت</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.filter((s) => !bookedSlots.includes(s)).map((t) => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      time === t ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border/20 hover:border-primary/40"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700">{error}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={sending || !selectedRequest || !date || !time}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
              {sending ? <Loader size={17} className="animate-spin" /> : <Send size={17} />}
              {sending ? "در حال ارسال..." : "ارسال دعوتنامه"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
