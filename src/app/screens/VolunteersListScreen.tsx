import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { getAvailableDonors } from "../services/requestStore";
import { canDonateTo } from "../lib/bloodCompatibility";
import type { DonorReadiness } from "../types";
import { ArrowLeft, User, MessageCircle, Search, MapPin, Filter } from "lucide-react";

const BLOOD_TYPES = ["همه", "O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

interface Props { onBack: () => void; onChat: (donorId: string, donorName: string) => void }

export const VolunteersListScreen = ({ onBack, onChat }: Props) => {
  const [donors, setDonors] = useState<DonorReadiness[]>([]);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("همه");

  const refresh = () => setDonors(getAvailableDonors());
  useEffect(() => { refresh(); const iv = setInterval(refresh, 5000); return () => clearInterval(iv); }, []);

  const filtered = donors.filter((d) => {
    const matchesSearch = !search || d.donorName.includes(search) || d.bloodType.includes(search) || d.city.includes(search);
    const matchesBlood = bloodFilter === "همه" || d.bloodType === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="bg-white flex-shrink-0">
        <div className="flex items-center gap-3 px-5 pt-2 pb-3">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <h1 className="text-lg font-bold text-foreground">لیست داوطلبان اهدا</h1>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نام، گروه خونی یا شهر..." className="w-full bg-muted/50 border border-border/30 rounded-xl pr-9 pl-4 py-2.5 text-xs text-foreground outline-none focus:border-primary/40 transition-colors" />
          </div>
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {BLOOD_TYPES.map((bt) => (
              <button key={bt} onClick={() => setBloodFilter(bt)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${bloodFilter === bt ? "bg-primary text-white border-primary" : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/40"}`}>{bt}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">داوطلبان آماده اهدا</h2>
            <span className="text-[10px] font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full">{filtered.length} نفر</span>
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/20 text-center">
              <User size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search || bloodFilter !== "همه" ? "نتیجه‌ای یافت نشد." : "هنوز داوطلبی ثبت‌نام نکرده است."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-primary/8 rounded-full flex items-center justify-center flex-shrink-0"><User size={20} className="text-primary" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <BloodBadge type={d.bloodType} size="sm" />
                          <span className="text-sm font-bold text-foreground truncate">{d.donorName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={10} />{d.city}</span>
                          <span className={`font-medium ${d.available ? "text-green-600" : "text-muted-foreground"}`}>{d.available ? "● آماده" : "○ مشغول"}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onChat(d.donorId, d.donorName)} className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0 mr-3">
                      <MessageCircle size={17} className="text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};