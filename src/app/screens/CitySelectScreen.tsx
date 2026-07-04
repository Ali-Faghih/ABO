import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { ALL_CITIES, getProvinceByCity } from "../data/constants";
import { ArrowLeft, Search, MapPin } from "lucide-react";

export const CitySelectScreen = ({ currentCity, onSelect, onBack }: { currentCity: string; onSelect: (c: string) => void; onBack: () => void }) => {
  const [search, setSearch] = useState("");
  const filtered = ALL_CITIES.filter((c) => c.includes(search));
  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <StatusBar />
      <div className="px-5 pt-2 pb-4 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
          <h1 className="text-lg font-bold text-foreground">انتخاب شهر</h1>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 rounded-2xl px-4 py-2.5">
          <Search size={15} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی شهر..." className="flex-1 bg-transparent text-sm outline-none text-right" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border/20">
        {filtered.map((city) => {
          const province = getProvinceByCity(city);
          return (
            <button key={city} onClick={() => { onSelect(city); onBack(); }} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${currentCity === city ? "border-primary bg-primary" : "border-border"}`}>{currentCity === city && <div className="w-2 h-2 bg-white rounded-full" />}</div>
              <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{city}</span>{province && <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{province}</span>}<MapPin size={14} className="text-muted-foreground" /></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
