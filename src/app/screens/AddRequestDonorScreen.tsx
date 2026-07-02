import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { PersianCalendar } from "../components/ui/PersianCalendar";
import { BLOOD_TYPES } from "../data/constants";
import { setDonorReadiness } from "../services/requestStore";
import { persianDateString } from "../lib/persian-calendar";
import type { DonorProfile } from "../types";
import { ArrowLeft, Heart, Calendar, ChevronDown, MapPin, CheckCircle } from "lucide-react";

export const AddRequestDonorScreen = ({ donor, onBack }: { donor: DonorProfile; onBack: () => void }) => {
  const [bloodType, setBloodType] = useState(donor.bloodType);
  const [date, setDate] = useState(persianDateString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSelectDate = (d: string) => { setDate(d); setShowCalendar(false); };
  if (submitted) return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-5 px-8" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle size={48} className="text-green-500" /></div>
      <div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">ثبت شد!</h2><p className="text-sm text-muted-foreground leading-relaxed">آمادگی اهدای خون شما ثبت شد. بیمارستان‌های نزدیک با شما تماس می‌گیرند.</p></div>
      <button onClick={onBack} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">بازگشت به خانه</button>
    </div>
  );
  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4 border-b border-border/30 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
        <h1 className="text-lg font-bold text-foreground">ثبت آمادگی اهدا</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-primary/8 border border-primary/15 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <Heart size={19} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">با ثبت آمادگی، به بیمارستان‌های نزدیک اعلام می‌کنید که آماده اهدای خون هستید.</p>
        </div>
        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-3 block">گروه خونی</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map((t) => (<button key={t} onClick={() => setBloodType(t)} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${bloodType === t ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border"}`}>{t}</button>))}
          </div>
        </div>
        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-3 block">تاریخ آمادگی</label>
          <button onClick={() => setShowCalendar(!showCalendar)} className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border flex items-center gap-3 text-right">
            <Calendar size={17} className="text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-sm text-foreground font-medium">{date}</span>
          </button>
          {showCalendar && (
            <div className="mt-2"><PersianCalendar selectedDate={date} onSelect={handleSelectDate} /></div>
          )}
        </div>
        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-3 block">شهر</label>
          <div className="bg-muted/60 rounded-2xl px-4 py-3.5 border border-border flex items-center justify-between">
            <ChevronDown size={17} className="text-muted-foreground" /><span className="text-sm text-foreground">{donor.city}</span><MapPin size={17} className="text-muted-foreground" />
          </div>
        </div>
        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-3 block">توضیحات (اختیاری)</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="توضیحات اضافه..." className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 border border-border text-sm outline-none text-right resize-none" style={{ direction: "rtl" }} />
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-border/40 flex-shrink-0">
        <button onClick={() => {
          setDonorReadiness({
            id: `RDY-${Date.now()}`,
            donorId: donor.id,
            donorName: donor.name,
            bloodType,
            city: donor.city,
            available: true,
            readinessDate: date,
            notes: notes || undefined,
          });
          setSubmitted(true);
        }} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20">ثبت آمادگی</button>
      </div>
    </div>
  );
};
