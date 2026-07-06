import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { PersianCalendar } from "../components/ui/PersianCalendar";
import { BLOOD_TYPES } from "../data/constants";
import { addRequest } from "../services/requestStore";
import { persianDateString } from "../lib/persian-calendar";
import type { HospitalProfile } from "../types";
import { ArrowLeft, Calendar, Zap, FileText, CheckCircle } from "lucide-react";

export const AddRequestHospitalScreen = ({ hospital, onBack }: { hospital: HospitalProfile; onBack: () => void }) => {
  const [bloodType, setBloodType] = useState("O-");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<"فوری" | "معمولی">("فوری");
  const [deadline, setDeadline] = useState(persianDateString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    const ok = await addRequest({
      id: `REQ-${Date.now()}`,
      hospitalId: hospital.username,
      hospitalName: hospital.name,
      bloodType,
      units,
      urgency,
      deadline,
      status: "active",
      matched: 0,
      city: hospital.city,
      createdAt: new Date().toLocaleDateString("fa-IR"),
      notes: notes || undefined,
    });
    if (ok) { onBack(); }
    else { setError("خطا در ثبت درخواست"); }
  };
  const handleSelectDeadline = (d: string) => { setDeadline(d); setShowCalendar(false) };
  if (submitted) return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-5 px-8" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle size={48} className="text-green-500" /></div>
      <div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">درخواست ثبت شد!</h2><p className="text-sm text-muted-foreground leading-relaxed">درخواست خون شما ثبت شد و به اهداکنندگان مناسب اطلاع‌رسانی می‌شود.</p></div>
      <button onClick={onBack} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">بازگشت</button>
    </div>
  );
  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4 border-b border-border/30 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
        <h1 className="text-lg font-bold text-foreground">ایجاد درخواست خون</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-5"><label className="text-sm font-bold text-foreground mb-3 block">گروه خونی مورد نیاز</label><div className="grid grid-cols-4 gap-2">{BLOOD_TYPES.map((t) => (<button key={t} onClick={() => setBloodType(t)} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${bloodType === t ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>{t}</button>))}</div></div>
        <div className="mb-5"><label className="text-sm font-bold text-foreground mb-3 block">تعداد واحد</label><div className="flex items-center gap-5 justify-center py-2"><button onClick={() => setUnits(Math.max(1, units - 1))} className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl font-bold">−</button><span className="text-4xl font-black text-primary w-16 text-center">{units}</span><button onClick={() => setUnits(units + 1)} className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-2xl font-bold text-white">+</button></div></div>
        <div className="mb-5"><label className="text-sm font-bold text-foreground mb-3 block">درجه اهمیت</label><div className="flex gap-3">{(["فوری", "معمولی"] as const).map((u) => (<button key={u} onClick={() => setUrgency(u)} className={`flex-1 py-3.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${urgency === u ? (u === "فوری" ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary") : "bg-white text-foreground border-border"}`}>{u === "فوری" ? <><Zap size={15} />{u}</> : <><FileText size={15} />{u}</>}</button>))}</div></div>
        <div className="mb-5"><label className="text-sm font-bold text-foreground mb-3 block">مهلت</label><button onClick={() => setShowCalendar(!showCalendar)} className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border flex items-center gap-3 text-right"><Calendar size={17} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-sm text-foreground font-medium">{deadline}</span></button>{showCalendar && <div className="mt-2"><PersianCalendar selectedDate={deadline} onSelect={handleSelectDeadline} /></div>}</div>
        <div className="mb-5"><label className="text-sm font-bold text-foreground mb-3 block">توضیحات پزشکی</label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="توضیحات اضافه..." className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-sm outline-none text-right resize-none" style={{ direction: "rtl" }} /></div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        <button onClick={handleSubmit} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">ارسال درخواست</button>
        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
};
