import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { BloodBadge } from "../components/ui/BloodBadge";
import { useAuth } from "../contexts/AuthContext";
import { getRequestsByHospital } from "../services/requestStore";
import { isHospitalListed, addToListed } from "../services/hospitalListStore";
import type { HospitalProfile, BloodRequest } from "../types";
import { LogOut, Building2, MapPin, Phone, TrendingUp, Users, Activity, Edit, Save, X, CheckCircle, List } from "lucide-react";

export const HospitalProfileScreen = ({ hospital, onLogout }: { hospital: HospitalProfile; onLogout: () => void }) => {
  const { updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "requests" | "stats">("info");
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(hospital.phone);
  const [editAddress, setEditAddress] = useState(hospital.address);
  const [listed, setListed] = useState(false);
  const activeReqs = requests.filter((r) => r.status === "active" || r.status === "matched");
  const completedReqs = requests.filter((r) => r.status === "completed");
  useEffect(() => { getRequestsByHospital(hospital.username).then(setRequests); const iv = setInterval(() => getRequestsByHospital(hospital.username).then(setRequests), 5000); return () => clearInterval(iv); }, [hospital.username]);
  useEffect(() => { isHospitalListed(hospital.username).then(setListed); }, [hospital.username]);

  const handleRequestListing = async () => {
    await addToListed(hospital.username);
    setListed(true);
  };
  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pb-4">
          <h1 className="text-lg font-bold text-foreground">پروفایل بیمارستان</h1>
          <button onClick={onLogout} className="w-9 h-9 bg-muted/70 rounded-full flex items-center justify-center"><LogOut size={17} className="text-foreground" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pb-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary/8 rounded-2xl flex items-center justify-center"><Building2 size={36} className="text-primary" /></div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-foreground leading-snug">{hospital.name}</h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold inline-block mt-1">{hospital.hospitalType}</span>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><MapPin size={11} />{hospital.city}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {[{ label: "درخواست فعال", value: String(activeReqs.length) }, { label: "تکمیل شده", value: String(completedReqs.length) }, { label: "اهداکنندگان", value: String(hospital.totalDonors) }].map((s) => (
              <div key={s.label} className="bg-muted/60 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-sm border border-border/20">
          {[{ id: "info", label: "اطلاعات" }, { id: "requests", label: "درخواست‌ها" }, { id: "stats", label: "آمار" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as "info" | "requests" | "stats")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? "bg-primary text-white" : "text-muted-foreground"}`}>{t.label}</button>
          ))}
        </div>
        {activeTab === "info" && (
          <div className="mx-4 mt-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              {[
                { label: "نام بیمارستان", value: hospital.name, icon: Building2 },
                ...(editing
                  ? [
                      { label: "تلفن", value: editPhone, icon: Phone, setter: setEditPhone as (v: string) => void },
                      { label: "آدرس", value: editAddress, icon: MapPin, setter: setEditAddress as (v: string) => void },
                    ]
                  : [
                      { label: "تلفن", value: hospital.phone, icon: Phone },
                      { label: "آدرس", value: hospital.address || "—", icon: MapPin },
                    ]
                ),
              ].map((item: any) => (
                <div key={item.label} className="flex items-start justify-between py-2.5 border-b border-border/30 last:border-0 gap-4">
                  {editing && item.setter ? (
                    <input type="text" value={item.value} onChange={(e) => item.setter(e.target.value)} className="flex-1 text-sm text-foreground font-medium bg-muted/60 rounded-xl px-3 py-1.5 outline-none text-right" />
                  ) : (
                    <span className="text-sm text-foreground font-medium text-right flex-1">{item.value}</span>
                  )}
                  <div className="flex items-center gap-2 flex-shrink-0"><span className="text-xs text-muted-foreground">{item.label}</span><item.icon size={13} className="text-muted-foreground" /></div>
                </div>
              ))}
            </div>
            {editing ? (
              <div className="flex gap-2 mt-3">
                <button onClick={async () => { await updateProfile({ phone: editPhone, address: editAddress } as any); setEditing(false); }} className="flex-1 bg-green-500 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Save size={15} />ذخیره تغییرات</button>
                <button onClick={() => { setEditing(false); setEditPhone(hospital.phone); setEditAddress(hospital.address); }} className="flex-1 bg-muted text-muted-foreground py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><X size={15} />انصراف</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="w-full mt-3 bg-primary/8 text-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Edit size={15} />ویرایش اطلاعات</button>
            )}
            {listed ? (
              <div className="w-full mt-3 bg-green-50 text-green-700 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><CheckCircle size={15} />بیمارستان در فهرست معتبر ثبت شده است</div>
            ) : (
              <button onClick={handleRequestListing} className="w-full mt-3 bg-primary/8 text-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><List size={15} />درخواست ثبت در فهرست بیمارستان‌های معتبر</button>
            )}
          </div>
        )}
        {activeTab === "requests" && (
          <div className="mx-4 mt-3 flex flex-col gap-2.5">
            {activeReqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/20 text-center">
                <p className="text-sm text-muted-foreground">درخواست فعالی ثبت نشده است.</p>
              </div>
            ) : (
              activeReqs.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <BloodBadge type={req.bloodType} size="sm" />
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-green-50 text-green-700">فعال</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>{req.units} واحد</span><span>{req.matched} مچ شده</span><span>مهلت: {req.deadline}</span></div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "stats" && (
          <div className="mx-4 mt-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
              <h3 className="text-sm font-bold text-foreground mb-4">آمار</h3>
              {[
                { label: "کل درخواست‌ها", value: String(requests.length), icon: TrendingUp },
                { label: "درخواست‌های فعال", value: String(activeReqs.length), icon: Activity },
                { label: "تکمیل شده", value: String(completedReqs.length), icon: Users },
              ].map((s: any) => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2"><s.icon size={14} className="text-primary" /><span className="text-base font-black text-foreground">{s.value}</span></div>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
