import { StatusBar } from "../components/ui/StatusBar";
import { Download, ArrowLeft, Droplets, CheckCircle } from "lucide-react";

export const ArticleDetailScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
    <div className="bg-white border-b border-border/30 flex-shrink-0">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <button className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center"><Download size={16} className="text-foreground" /></button>
        <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">آموزشی</span>
      <h1 className="text-2xl font-black text-foreground mt-3 mb-2 leading-snug">همه چیز درباره اهدای خون</h1>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5"><span>۱ تیر ۱۴۰۳</span><span>•</span><span>۵ دقیقه مطالعه</span></div>
      <div className="w-full h-44 bg-primary/8 rounded-2xl mb-5 flex items-center justify-center"><Droplets size={52} className="text-primary/25" strokeWidth={1} /></div>
      <div className="text-sm text-foreground leading-[1.9] space-y-4">
        <p>اهدای خون یکی از مهم‌ترین اقدامات انسان‌دوستانه‌ای است که می‌تواند به‌طور مستقیم جان افراد دیگر را نجات دهد. هر بار که خون اهدا می‌کنید، می‌توانید تا سه نفر را نجات دهید.</p>
        <h2 className="text-base font-black text-foreground">چه کسانی می‌توانند خون اهدا کنند؟</h2>
        <p>هر فردی که سالم باشد، بین ۱۸ تا ۶۵ سال سن داشته باشد، وزنش بیشتر از ۵۰ کیلوگرم باشد و حداقل ۵۶ روز از آخرین اهدای خونش گذشته باشد.</p>
        <h2 className="text-base font-black text-foreground">مزایای اهدای خون</h2>
        <div className="flex flex-col gap-2.5">
          {["کمک به نجات جان بیماران", "کاهش خطر بیماری‌های قلبی", "تولید سلول‌های خونی جدید", "آزمایش رایگان خون"].map((item) => (
            <div key={item} className="flex items-center gap-2.5"><CheckCircle size={16} className="text-green-500 flex-shrink-0" /><span>{item}</span></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
