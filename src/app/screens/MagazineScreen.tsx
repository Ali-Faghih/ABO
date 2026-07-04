import { useState } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { ARTICLES } from "../data/catalog";
import { ChevronRight, FileText } from "lucide-react";

export const MagazineScreen = ({ onArticle }: { onArticle: () => void }) => {
  const [activeCategory, setActiveCategory] = useState("همه");
  const categories = ["همه", "آموزشی", "سلامت", "مراقبت", "علمی"];
  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-4">
          <h1 className="text-lg font-bold text-foreground mb-3">مجله اهدای خون</h1>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ direction: "rtl" }}>
            {categories.map((c) => (<button key={c} onClick={() => setActiveCategory(c)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === c ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{c}</button>))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <button onClick={onArticle} className="w-full bg-primary rounded-3xl p-5 mb-4 relative overflow-hidden text-right">
          <div className="absolute -left-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold">ویژه</span>
            <h2 className="text-white text-lg font-black mt-3 mb-2 leading-tight">همه چیز درباره اهدای خون</h2>
            <p className="text-white/65 text-xs mb-4 leading-relaxed">راهنمای کامل برای کسانی که می‌خواهند برای اولین بار خون اهدا کنند...</p>
            <div className="flex items-center gap-3"><span className="text-white/50 text-[10px]">۵ دقیقه مطالعه</span><span className="text-white/50 text-[10px]">۱ تیر ۱۴۰۳</span></div>
          </div>
        </button>
        <div className="flex flex-col gap-2.5">
          {ARTICLES.slice(1).map((article) => (
            <button key={article.id} onClick={onArticle} className="bg-white rounded-2xl p-4 shadow-sm border border-border/20 flex items-center gap-4 w-full text-right">
              <div className="w-14 h-14 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0"><FileText size={24} className="text-primary" /></div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${article.category === "سلامت" ? "bg-green-50 text-green-700" : article.category === "مراقبت" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{article.category}</span>
                <p className="text-sm font-bold text-foreground mt-1 leading-tight">{article.title}</p>
                <div className="flex items-center gap-3 mt-1"><span className="text-[10px] text-muted-foreground">{article.readTime} مطالعه</span><span className="text-[10px] text-muted-foreground">{article.date}</span></div>
              </div>
              <ChevronRight size={15} className="text-muted-foreground flex-shrink-0 rotate-180" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
