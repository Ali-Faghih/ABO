import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { PersianCalendar } from "../components/ui/PersianCalendar";
import { parsePersianDate } from "../lib/persian-calendar";
import { addAppointment, getBookedTimeSlots, TIME_SLOTS } from "../services/appointmentStore";
import { getConversationByRequestAndParticipants, addConversation } from "../services/chatStore";
import { useAuth } from "../contexts/AuthContext";
import type { BloodRequest, DonorProfile } from "../types";
import { canDonateTo } from "../lib/bloodCompatibility";
import { ArrowLeft, Calendar, Clock, Building2, MapPin, MessageCircle, CheckCircle, Ban, Timer as TimerIcon } from "lucide-react";

interface Props { request: BloodRequest; onBack: () => void; onChat: (convId: string) => void }

export const BookAppointmentScreen = ({ request, onBack, onChat }: Props) => {
  const { user, updateProfile } = useAuth();
  const donor = user as DonorProfile | null;
  const [step, setStep] = useState<"calendar" | "time" | "confirm" | "done">("calendar");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const bookedSlots = selectedDate ? getBookedTimeSlots(request.hospitalId, selectedDate) : [];
  const [countdown, setCountdown] = useState("");
  const [convId, setConvId] = useState("");

  useEffect(() => {
    if (!donor || donor.eligible || !donor.nextEligible) return;
    const target = parsePersianDate(donor.nextEligible);
    if (target && target.getTime() <= Date.now()) {
      updateProfile({ eligible: true, nextEligible: undefined });
    }
  }, []);

  useEffect(() => {
    if (step !== "done" || !selectedDate) return;
    if (!donor) return;
    const conv = getConversationByRequestAndParticipants(request.id, donor.id, request.hospitalId);
    if (conv) setConvId(conv.id);
    const target = parsePersianDate(selectedDate);
    if (!target) return;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown("امروز"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdown(`${days} روز و ${hours} ساعت`);
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, [step, selectedDate, request.id, donor]);

  const eligibilityError = !donor
    ? "لطفا وارد حساب کاربری خود شوید"
    : !canDonateTo(donor.bloodType, request.bloodType)
      ? "گروه خونی شما با این درخواست مطابقت ندارد"
      : !donor.eligible
        ? `شما تا تاریخ ${donor.nextEligible ?? "نامشخص"} نمی‌توانید خون اهدا کنید`
        : request.status !== "active" && request.status !== "matched"
          ? "این درخواست دیگر فعال نیست"
          : null;

  if (eligibilityError) return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-5 px-8" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center"><Ban size={48} className="text-red-500" /></div>
      <div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">امکان رزرو وجود ندارد</h2><p className="text-sm text-muted-foreground leading-relaxed">{eligibilityError}</p></div>
      <button onClick={onBack} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">بازگشت</button>
    </div>
  );

  const handleBook = () => {
    if (!donor) return;
    const now = new Date().toLocaleDateString("fa-IR");
    addAppointment({
      id: `APT-${Date.now()}`,
      donorId: donor.id,
      donorName: donor.name,
      hospitalId: request.hospitalId,
      hospitalName: request.hospitalName,
      requestId: request.id,
      bloodType: request.bloodType,
      date: selectedDate,
      time: selectedTime,
      status: "pending",
      createdAt: now,
    });
    let conv = getConversationByRequestAndParticipants(request.id, donor.id, request.hospitalId);
    if (!conv) {
      const cid = `CONV-${Date.now()}`;
      addConversation({
        id: cid,
        participants: [donor.id, request.hospitalId],
        hospitalId: request.hospitalId,
        hospitalName: request.hospitalName,
        donorId: donor.id,
        donorName: donor.name,
        requestId: request.id,
        lastMessage: "رزرو نوبت انجام شد",
        lastMessageTime: "همین حالا",
        unread: 1,
      });
      conv = { id: cid, participants: [donor.id, request.hospitalId], hospitalId: request.hospitalId, hospitalName: request.hospitalName, donorId: donor.id, donorName: donor.name, requestId: request.id, lastMessage: "", lastMessageTime: "", unread: 0 };
    }
    setStep("done");
  };

  if (step === "done") return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-5 px-8" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle size={48} className="text-green-500" /></div>
      <div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">نوبت شما رزرو شد!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">نوبت اهدای خون شما در تاریخ {selectedDate} ساعت {selectedTime} در {request.hospitalName} ثبت شد.</p>
      </div>
      {countdown && (
        <div className="bg-muted/60 rounded-2xl px-5 py-3 flex items-center gap-3 w-full">
          <TimerIcon size={18} className="text-primary" />
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">زمان باقی‌مانده تا نوبت</p>
            <p className="text-sm font-bold text-foreground">{countdown}</p>
          </div>
        </div>
      )}
      {convId && (
        <button onClick={() => onChat(convId)} className="w-full bg-primary/8 text-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><MessageCircle size={16} />چت با بیمارستان</button>
      )}
      <button onClick={onBack} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">بازگشت به صفحه اصلی</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4 bg-white border-b border-border/30 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">رزرو نوبت اهدا</h1>
          <p className="text-xs text-muted-foreground">{request.hospitalName}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center"><span className="text-primary font-black text-sm">{request.bloodType}</span></div>
            <div><p className="text-sm font-bold text-foreground">{request.bloodType} - {request.hospitalName}</p><p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin size={11} />{request.city}</p></div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3"><Building2 size={13} /><span>{request.urgency} • {request.units} واحد • مهلت: {request.deadline}</span></div>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step === "calendar" ? "bg-primary text-white" : "bg-green-50 text-green-700"}`}><Calendar size={15} /></div>
            <span className={`text-sm font-bold ${step === "time" || step === "confirm" ? "text-green-700" : step === "calendar" ? "text-foreground" : "text-muted-foreground"}`}>انتخاب تاریخ</span>
          </div>
          <PersianCalendar selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); if (d) setStep("time"); }} />
        </div>
        {selectedDate && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step === "time" ? "bg-primary text-white" : step === "confirm" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}><Clock size={15} /></div>
              <span className={`text-sm font-bold ${step === "confirm" ? "text-green-700" : "text-foreground"}`}>انتخاب ساعت</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((t) => {
                  const disabled = bookedSlots.includes(t);
                  return (
                    <button key={t} disabled={disabled} onClick={() => { setSelectedTime(t); setStep("confirm"); }}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${selectedTime === t ? "bg-primary text-white border-primary" : disabled ? "bg-muted/40 text-muted-foreground/40 line-through border-border/40 cursor-not-allowed" : "bg-white text-foreground border-border hover:border-primary/40"}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {selectedDate && selectedTime && step === "confirm" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
            <h3 className="text-sm font-bold text-foreground mb-3">خلاصه نوبت</h3>
            <div className="space-y-2 text-xs text-muted-foreground mb-4">
              <div className="flex justify-between"><span>بیمارستان</span><span className="text-foreground font-medium">{request.hospitalName}</span></div>
              <div className="flex justify-between"><span>گروه خونی</span><span className="text-foreground font-medium">{request.bloodType}</span></div>
              <div className="flex justify-between"><span>تاریخ</span><span className="text-foreground font-medium">{selectedDate}</span></div>
              <div className="flex justify-between"><span>ساعت</span><span className="text-foreground font-medium">{selectedTime}</span></div>
            </div>
            <button onClick={handleBook} className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">تأیید و ثبت نوبت</button>
          </div>
        )}
      </div>
    </div>
  );
};
