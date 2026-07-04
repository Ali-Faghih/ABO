import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import {
  getRegistryDonors, addRegistryDonor, updateRegistryDonor, deleteRegistryDonor,
  getRegistryHospitals, addRegistryHospital, updateRegistryHospital, deleteRegistryHospital,
  resetRegistry,
} from "../services/registryDb";
import type { RegistryDonor, RegistryHospital } from "../types";
import { ArrowLeft, Plus, Edit3, Trash2, RotateCcw, Save, X, User, Building2 } from "lucide-react";

type Tab = "donors" | "hospitals";

const emptyDonor = (): RegistryDonor => ({ nationalId: "", firstName: "", lastName: "", birthDate: "", phone: "" });
const emptyHospital = (): RegistryHospital => ({ hospitalId: "", name: "", type: "دولتی", city: "", province: "", licenseNumber: "", address: "" });

export const RegistryAdminScreen = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<Tab>("donors");
  const [donors, setDonors] = useState(getRegistryDonors());
  const [hospitals, setHospitals] = useState(getRegistryHospitals());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RegistryDonor | RegistryHospital>(emptyDonor());
  const [formError, setFormError] = useState("");

  const refresh = () => { setDonors(getRegistryDonors()); setHospitals(getRegistryHospitals()); };

  const openAdd = () => {
    setForm(tab === "donors" ? emptyDonor() : emptyHospital());
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const list = tab === "donors" ? donors : hospitals;
    const found = tab === "donors"
      ? (list as RegistryDonor[]).find((d) => d.nationalId === id)
      : (list as RegistryHospital[]).find((h) => h.hospitalId === id);
    if (!found) return;
    setForm({ ...found });
    setEditingId(id);
    setFormError("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (tab === "donors") {
      const d = form as RegistryDonor;
      if (!d.nationalId.trim() || !d.firstName.trim() || !d.lastName.trim()) {
        setFormError("کد ملی، نام و نام خانوادگی الزامی است.");
        return;
      }
      if (editingId !== null) {
        if (!updateRegistryDonor(editingId, d)) {
          setFormError("خطا در به‌روزرسانی.");
          return;
        }
      } else {
        if (!addRegistryDonor(d)) {
          setFormError("این کد ملی قبلاً ثبت شده است.");
          return;
        }
      }
    } else {
      const h = form as RegistryHospital;
      if (!h.hospitalId.trim() || !h.name.trim()) {
        setFormError("کد بیمارستان و نام الزامی است.");
        return;
      }
      if (editingId !== null) {
        if (!updateRegistryHospital(editingId, h)) {
          setFormError("خطا در به‌روزرسانی.");
          return;
        }
      } else {
        if (!addRegistryHospital(h)) {
          setFormError("این کد بیمارستان قبلاً ثبت شده است.");
          return;
        }
      }
    }
    setFormError("");
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (tab === "donors") deleteRegistryDonor(id);
    else deleteRegistryHospital(id);
    refresh();
  };

  const handleReset = () => {
    resetRegistry();
    refresh();
  };

  const renderForm = () => {
    const isDonor = tab === "donors";
    const f = form as any;
    const fields = isDonor
      ? [
          { label: "کد ملی", key: "nationalId", ph: "0012345678" },
          { label: "نام", key: "firstName", ph: "علی" },
          { label: "نام خانوادگی", key: "lastName", ph: "محمدی" },
          { label: "تاریخ تولد", key: "birthDate", ph: "۱۳۷۰/۰۲/۱۵" },
          { label: "تلفن", key: "phone", ph: "۰۹۱۲۱۱۱۱۲۲۲" },
        ]
      : [
          { label: "کد بیمارستان", key: "hospitalId", ph: "HOSP-001" },
          { label: "نام", key: "name", ph: "بیمارستان امام خمینی" },
          { label: "نوع", key: "type", ph: "دولتی" },
          { label: "شهر", key: "city", ph: "تهران" },
          { label: "استان", key: "province", ph: "تهران" },
          { label: "شماره مجوز وزارت بهداشت", key: "licenseNumber", ph: "IR-MOH-1001-1401" },
          { label: "آدرس", key: "address", ph: "خیابان..." },
        ];

    return (
      <div className="absolute inset-0 z-50 bg-white flex flex-col" dir="rtl">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/30">
          <button onClick={() => setShowForm(false)} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center">
            <X size={16} className="text-foreground" />
          </button>
          <h2 className="text-sm font-bold text-foreground">{editingId !== null ? "ویرایش" : "افزودن"} {isDonor ? "اهداکننده" : "بیمارستان"}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-bold text-foreground mb-1.5 block">{field.label}</label>
              <div className="bg-muted/60 rounded-2xl px-4 py-3 border border-border">
                <input type="text" value={f[field.key] || ""} onChange={(e) => setForm({ ...f, [field.key]: e.target.value })} placeholder={field.ph} className="w-full bg-transparent text-sm outline-none text-right placeholder:text-muted-foreground/50" />
              </div>
            </div>
          ))}
          {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}
        </div>
        <div className="px-5 pb-8 pt-3 border-t border-border/40">
          <button onClick={handleSave} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Save size={16} />ذخیره
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pb-4">
          <h1 className="text-lg font-bold text-foreground">مدیریت سامانه ثبت احوال</h1>
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
        </div>
        <div className="flex gap-1 mx-4 pb-4">
          {[{ id: "donors", label: "اهداکنندگان", icon: User }, { id: "hospitals", label: "بیمارستان‌ها", icon: Building2 }].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id as Tab); setShowForm(false); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${tab === t.id ? "bg-primary text-white shadow-sm" : "bg-muted text-muted-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Plus size={14} />افزودن
          </button>
          <button onClick={handleReset} className="bg-muted text-muted-foreground px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <RotateCcw size={13} />بازنشانی
          </button>
        </div>
        <div className="px-4 flex flex-col gap-2">
          {(tab === "donors" ? donors : hospitals).map((entry) => {
            const entryId = tab === "donors" ? (entry as RegistryDonor).nationalId : (entry as RegistryHospital).hospitalId;
            return (
            <div key={entryId} className="bg-white rounded-2xl p-3.5 shadow-sm border border-border/20 flex items-center gap-3">
              <div className={`w-10 h-10 ${tab === "donors" ? "bg-primary/8" : "bg-secondary/8"} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {tab === "donors" ? <User size={18} className="text-primary" /> : <Building2 size={18} className="text-secondary" />}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-foreground truncate">
                  {tab === "donors" ? `${(entry as RegistryDonor).firstName} ${(entry as RegistryDonor).lastName}` : (entry as RegistryHospital).name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {tab === "donors" ? `کد ملی: ${(entry as RegistryDonor).nationalId}` : `کد: ${(entry as RegistryHospital).hospitalId}`}
                </p>
              </div>
              <button onClick={() => openEdit(entryId)} className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center flex-shrink-0"><Edit3 size={13} className="text-muted-foreground" /></button>
              <button onClick={() => handleDelete(entryId)} className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><Trash2 size={13} className="text-red-500" /></button>
            </div>
            );
          })}
          {(tab === "donors" ? donors : hospitals).length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">موردی یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
      {showForm && renderForm()}
    </div>
  );
};
