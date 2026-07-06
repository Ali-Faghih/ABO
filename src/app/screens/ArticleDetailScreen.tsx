import { useState, useEffect } from "react";
import { StatusBar } from "../components/ui/StatusBar";
import { getArticleById } from "../services/magazineStore";
import type { Article } from "../services/magazineStore";
import { ArrowLeft, Droplets, Loader } from "lucide-react";

export const ArticleDetailScreen = ({ articleId, onBack }: { articleId: string; onBack: () => void }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getArticleById(articleId);
        if (!cancelled) setArticle(data);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white" dir="rtl">
        <Loader size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white gap-3" dir="rtl">
        <p className="text-muted-foreground text-sm">مقاله یافت نشد</p>
        <button onClick={onBack} className="text-primary text-sm font-bold">بازگشت</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <div className="bg-white border-b border-border/30 flex-shrink-0">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div className="w-9 h-9" />
          <button onClick={onBack} className="w-9 h-9 bg-muted/60 rounded-xl flex items-center justify-center"><ArrowLeft size={19} className="text-foreground rotate-180" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{article.category}</span>
        <h1 className="text-2xl font-black text-foreground mt-3 mb-2 leading-snug">{article.title}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5"><span>{article.publishDate}</span></div>
        <div className="w-full h-44 bg-primary/8 rounded-2xl mb-5 flex items-center justify-center"><Droplets size={52} className="text-primary/25" strokeWidth={1} /></div>
        <div className="text-sm text-foreground leading-[1.9] space-y-4" style={{ whiteSpace: "pre-wrap" }}>
          {article.content}
        </div>
      </div>
    </div>
  );
};