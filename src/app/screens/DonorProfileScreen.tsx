import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { useAuth } from "../contexts/AuthContext";
import { getReadinessByDonor } from "../services/requestStore";
import type { DonorProfile, DonorReadiness } from "../types";
import { LogOut, Camera, User, Award, Activity, Phone, MapPin, Edit, CheckCircle, Save, X } from "lucide-react";

export const DonorProfileScreen = ({ donor, onLogout }: { donor: DonorProfile; onLogout: () => void }) => {
  const { updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "history" | "health">("info");
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(donor.phone);
  const [editCity, setEditCity] = useState(donor.city);
  const [editWeight, setEditWeight] = useState(String(donor.weight ?? ""));
  const [lastReadiness, setLastReadiness] = useState<DonorReadiness | null>(null);
  useEffect(() => { getReadinessByDonor(donor.id).then(setLastReadiness); }, [donor.id]);
  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pb-4">
          <h1 className="text-lg font-bold text-foreground">پروفایل من</h1>
          <button onClick={onLogout} className="w-9 h-9 bg-muted/70 rounded-full flex items-center justify-center"><LogOut size={17} className="text-foreground" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pb-5 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/8 rounded-2xl flex items-center justify-center"><User size={36} className="text-primary" /></div>
              <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white"><Camera size={13} className="text-white" /></button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{donor.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <BloodBadge type={donor.bloodType} size="sm" />
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${donor.eligible ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{donor.eligible ? "● آماده اهدا" : "○ در انتظار"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Award size={11} className="text-amber-500" />{donor.donations} بار اهدای خون</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {[{ label: "اهداها", value: String(donor.donations) }, { label: "جان نجات‌داده", value: donor.donations > 0 ? String(donor.donations * 3) : "۰" }, { label: "عضویت از", value: donor.joinDate }].map((s) => (
              <div key={s.label} className="bg-muted/60 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-sm border border-border/20">
          {[{ id: "info", label: "اطلاعات" }, { id: "history", label: "تاریخچه" }, { id: "health", label: "سلامت" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as "info" | "history" | "health")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? "bg-primary text-white" : "text-muted-foreground"}`}>{t.label}</button>
          ))}
        </div>
        {activeTab === "info" && (
          <div className="mx-4 mt-3 flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              {[
                { label: "نام کامل", value: donor.name, icon: User },
                ...(editing
                  ? [
                      { label: "شماره موبایل", value: editPhone, icon: Phone, setter: setEditPhone as (v: string) => void },
                      { label: "شهر", value: editCity, icon: MapPin, setter: setEditCity as (v: string) => void },
                      { label: "وزن", value: editWeight, icon: Activity, setter: setEditWeight },
                    ]
                  : [
                      { label: "شماره موبایل", value: donor.phone, icon: Phone },
                      { label: "شهر", value: donor.city, icon: MapPin },
                      ...(donor.weight ? [{ label: "وزن", value: `${donor.weight} کیلوگرم`, icon: Activity }] : []),
                    ]
                ),
              ].map((item: any) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  {editing && item.setter ? (
                    <input type="text" value={item.value} onChange={(e) => item.setter(e.target.value)} className="flex-1 text-sm text-foreground font-medium bg-muted/60 rounded-xl px-3 py-1.5 outline-none text-right" />
                  ) : (
                    <span className="text-sm text-foreground font-medium">{item.value}</span>
                  )}
                  <div className="flex items-center gap-2 flex-shrink-0 mr-2"><span className="text-xs text-muted-foreground">{item.label}</span><item.icon size={13} className="text-muted-foreground" /></div>
                </div>
              ))}
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={async () => { await updateProfile({ phone: editPhone, city: editCity, weight: editWeight ? Number(editWeight) : undefined } as any); setEditing(false); }} className="flex-1 bg-green-500 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Save size={15} />ذخیره تغییرات</button>
                <button onClick={() => { setEditing(false); setEditPhone(donor.phone); setEditCity(donor.city); setEditWeight(String(donor.weight ?? "")); }} className="flex-1 bg-muted text-muted-foreground py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><X size={15} />انصراف</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="w-full bg-primary/8 text-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Edit size={15} />ویرایش اطلاعات</button>
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div className="mx-4 mt-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              <p className="text-sm text-muted-foreground text-center py-6">{lastReadiness ? `آخرین ثبت آمادگی: ${lastReadiness.readinessDate} (${lastReadiness.available ? "فعال" : "غیرفعال"})` : "هنوز سابقه اهدایی ثبت نشده است."}</p>
            </div>
          </div>
        )}
        {activeTab === "health" && (
          <div className="mx-4 mt-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              {[
                { label: "وضعیت کلی", value: "سالم" },
                { label: "آخرین اهدا", value: donor.lastDonation ?? "—" },
                { label: "اهدای بعدی (مجاز از)", value: donor.nextEligible ?? "—" },
                { label: "بیماری خاص", value: donor.diseaseName ?? "ندارد" },
                { label: "مصرف دارو", value: donor.medicationName ?? "ندارد" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span className="text-sm text-foreground">{item.value}</span></div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
