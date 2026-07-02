import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { formatBloodTypeHero } from "../lib/formatBloodType";
import { parsePersianDate } from "../lib/persian-calendar";
import { getActiveRequests } from "../services/requestStore";
import { getRegistryHospitals } from "../services/registryDb";
import { getListedHospitalIds } from "../services/hospitalListStore";
import type { DonorProfile } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { MapPin, Bell, ChevronDown, Droplets, AlertCircle, Building2, Star, Calendar, Clock } from "lucide-react";
import type { BloodRequest, RegistryHospital } from "../types";

interface Props { donor: DonorProfile; city: string; onCityClick: () => void; onAction: (fn: () => void) => void; onBookRequest: (req: BloodRequest) => void; onMyAppointments: () => void; onNotifications: () => void }

export const DonorHomeScreen = ({ donor, city, onCityClick, onAction, onBookRequest, onMyAppointments, onNotifications }: Props) => {
  const { updateProfile } = useAuth();
  const [allRequests, setAllRequests] = useState(getActiveRequests());
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const requests = showAllCities ? allRequests : allRequests.filter((r) => r.city === city);
  const [timeLeft, setTimeLeft] = useState<{ months: number; days: number; hours: number } | null>(null);
  useEffect(() => {
    if (donor.eligible || !donor.nextEligible) { setTimeLeft(null); return; }
    const tick = () => {
      const target = parsePersianDate(donor.nextEligible!);
      if (!target) { setTimeLeft(null); return; }
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); updateProfile({ eligible: true, nextEligible: undefined }); return; }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      setTimeLeft({ months: Math.floor(totalHours / (30 * 24)), days: Math.floor((totalHours % (30 * 24)) / 24), hours: totalHours % 24 });
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, [donor.eligible, donor.nextEligible, updateProfile]);
  const [listedHospitals, setListedHospitals] = useState(() => {
    const all = getRegistryHospitals();
    const ids = getListedHospitalIds();
    return all.filter((h) => ids.includes(h.hospitalId));
  });
  useEffect(() => {
    setAllRequests(getActiveRequests());
    const all = getRegistryHospitals();
    const ids = getListedHospitalIds();
    setListedHospitals(all.filter((h) => ids.includes(h.hospitalId)));
    const iv = setInterval(() => {
      setAllRequests(getActiveRequests());
      const a = getRegistryHospitals();
      const i = getListedHospitalIds();
      setListedHospitals(a.filter((h) => i.includes(h.hospitalId)));
    }, 5000);
    return () => clearInterval(iv);
  }, []);
  return (
  <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    <div className="bg-white flex-shrink-0">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <span className="text-xs text-muted-foreground">سلام،</span>
          <div className="text-lg font-bold text-foreground">{donor.name} 👋</div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={onCityClick} className="flex items-center gap-1.5 bg-muted/70 px-3 py-1.5 rounded-full">
            <MapPin size={12} className="text-primary" />
            <span className="text-xs font-medium text-foreground">{city}</span>
            <ChevronDown size={11} className="text-muted-foreground" />
          </button>
          <button onClick={() => onAction(onNotifications)} className="relative w-9 h-9 bg-muted/70 rounded-full flex items-center justify-center">
            <Bell size={17} className="text-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
          </button>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-4 mt-4 bg-primary rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-white/60 text-xs mb-1">گروه خونی شما</p>
              <span className="text-5xl font-black text-white leading-none">{formatBloodTypeHero(donor.bloodType)}</span>
            </div>
            <div className="bg-white/20 rounded-2xl p-3"><Droplets size={30} className="text-white" strokeWidth={1.5} /></div>
          </div>
          <div className="flex items-center gap-3">
            {[{ label: "اهداها", value: String(donor.donations) }, { label: "آخرین اهدا", value: donor.lastDonation ?? "—" }, { label: "وضعیت", value: donor.eligible ? "آماده" : "در انتظار", green: donor.eligible }].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-3 py-2 text-center flex-1">
                <p className="text-white/60 text-[10px] mb-0.5">{s.label}</p>
                <p className={`font-bold text-xs ${(s as any).green ? "text-green-300" : "text-white"}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {timeLeft && (
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-white/60 text-[10px] mb-1">زمان تا اهدای بعدی</p>
              <p className="text-white font-bold text-sm">{timeLeft.months > 0 ? `${timeLeft.months} ماه ` : ""}{timeLeft.days} روز {timeLeft.hours} ساعت</p>
            </div>
          )}
        </div>
      </div>
      <div className="mx-4 mt-4">
        <button onClick={() => onAction(onMyAppointments)} className="w-full bg-secondary rounded-2xl p-3.5 flex items-center gap-3 shadow-lg shadow-secondary/20 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Clock size={20} className="text-white" /></div>
          <div className="text-right flex-1">
            <p className="text-white font-bold text-sm">نوبت‌های من</p>
            <p className="text-white/65 text-[11px] mt-0.5">مشاهده و مدیریت نوبت‌های اهدا</p>
          </div>
        </button>
      </div>
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onAction(() => setShowAllCities(!showAllCities))} className="text-xs text-primary font-semibold">{showAllCities ? "فقط شهر من" : "مشاهده همه"}</button>
          <h2 className="text-sm font-bold text-foreground">{showAllCities ? "همه درخواست‌ها" : "درخواست‌های نزدیک"}</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {requests.map((req) => (
            <button key={req.id} onClick={() => onAction(() => onBookRequest(req))} className="bg-white rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm border border-border/20 w-full text-right">
              <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black text-sm">{req.bloodType}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${req.urgency === "فوری" ? "bg-red-50 text-primary" : "bg-green-50 text-green-700"}`}>{req.urgency}</span>
                  <span className="text-[10px] text-muted-foreground">{req.city}</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{req.hospitalName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">مهلت: {req.deadline} • {req.units} واحد</p>
              </div>
              <div className="flex-shrink-0"><Calendar size={16} className="text-primary/60" /></div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 px-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onAction(() => setShowAllHospitals(!showAllHospitals))} className="text-xs text-primary font-semibold">{showAllHospitals ? "پیشنهادی" : "همه"}</button>
          <h2 className="text-sm font-bold text-foreground">{showAllHospitals ? "همه بیمارستان‌ها" : "بیمارستان‌های پیشنهادی"}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(showAllHospitals ? listedHospitals : listedHospitals.filter((h) => h.city === city)).map((h) => (
            <button key={h.hospitalId} onClick={() => onAction(() => {})} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20 flex-shrink-0 w-44 text-right">
              <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center mb-3"><Building2 size={20} className="text-primary" /></div>
              <p className="text-sm font-bold text-foreground leading-tight mb-1">{h.name}</p>
              <p className="text-[11px] text-muted-foreground mb-2.5">{h.type} • {h.city}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-foreground">۴.۸</span></div>
                <span className="text-[10px] text-muted-foreground">{h.city}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};
