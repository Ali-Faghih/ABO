import type { MagazineArticle } from "../types";

const DB_KEY = "abo_db_magazine";

function read(): MagazineArticle[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MagazineArticle[];
  } catch {
    return [];
  }
}

function write(data: MagazineArticle[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function seedMagazine(): void {
  if (read().length > 0) return;

  const articles: MagazineArticle[] = [
    {
      id: "MAG-001",
      title: "اهمیت اهدای خون و تأثیر آن بر سلامت جامعه",
      content: `اهدای خون یکی از والاترین اقدامات انسانی است که هر ساله جان میلیون‌ها نفر را در سراسر جهان نجات می‌دهد. هر واحد خون اهدایی می‌تواند جان سه نفر را نجات دهد.\n\nفواید اهدای خون برای سلامتی:\n۱. کاهش خطر بیماری‌های قلبی و عروقی\n۲. کاهش آهن اضافی بدن\n۳. تحریک تولید سلول‌های خونی جدید\n۴. بررسی وضعیت سلامت عمومی قبل از اهدا\n\nافرادی که به طور منظم خون اهدا می‌کنند، از سلامت عمومی بهتری برخوردار هستند و احتمال ابتلا به بیماری‌های قلبی در آنها کاهش می‌یابد.`,
      summary: "با اهدای خون خود، به نجات جان دیگران کمک کنید و از فواید سلامتی آن بهره‌مند شوید.",
      author: "دکتر علی رضایی",
      category: "آموزشی",
      tags: ["اهدای خون", "سلامت", "فرهنگ سازی"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۱/۱۵",
      readCount: 1247,
      status: "published",
    },
    {
      id: "MAG-002",
      title: "شرایط و ضوابط اهدای خون: چه کسانی می‌توانند خون اهدا کنند؟",
      content: `برای اهدای خون، باید شرایط زیر را داشته باشید:\n\n۱. سن بین ۱۸ تا ۶۰ سال\n۲. وزن حداقل ۵۰ کیلوگرم\n۳. فشار خون نرمال\n۴. نداشتن بیماری‌های واگیردار\n۵. عدم مصرف الکل ۲۴ ساعت قبل از اهدا\n۶. خواب کافی شب قبل از اهدا\n\nافرادی که خالکوبی یا تتو انجام داده‌اند تا یک سال پس از آن نمی‌توانند خون اهدا کنند.\n\nمصرف برخی داروها مانند آنتی‌بیوتیک‌ها ممکن است باعث ممنوعیت موقت اهدای خون شود.`,
      summary: "آیا شرایط اهدای خون را دارید؟ راهنمای کامل شرایط و ضوابط اهدای خون را بخوانید.",
      author: "دکتر مریم حسینی",
      category: "راهنما",
      tags: ["شرایط اهدا", "سلامت", "راهنما"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۲/۰۱",
      readCount: 892,
      status: "published",
    },
    {
      id: "MAG-003",
      title: "گروه‌های خونی و سازگاری در اهدای خون",
      content: `شناخت گروه‌های خونی و سازگاری آنها برای اهدای خون بسیار مهم است.\n\nگروه‌های خونی اصلی:\n• A+: ۳۰٪ جمعیت\n• O+: ۳۵٪ جمعیت\n• B+: ۲۵٪ جمعیت\n• AB+: ۵٪ جمعیت\n• O-: ۴٪ جمعیت (دهنده عمومی)\n• A-: ۱٪ جمعیت\n• B-: ۱٪ جمعیت\n• AB-: ۱٪ جمعیت (گیرنده عمومی)\n\nگروه خونی O- به عنوان دهنده عمومی شناخته می‌شود زیرا می‌تواند به تمام گروه‌های خونی خون اهدا کند.`,
      summary: "همه چیز درباره گروه‌های خونی و سازگاری آنها در فرآیند اهدای خون.",
      author: "دکتر سعید کریمی",
      category: "آموزشی",
      tags: ["گروه خونی", "سازگاری", "آموزشی"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۲/۱۵",
      readCount: 1563,
      status: "published",
    },
    {
      id: "MAG-004",
      title: "بعد از اهدای خون چه باید کرد؟",
      content: `مراقبت‌های پس از اهدای خون:\n\n۱. تا ۱۵ دقیقه در محل استراحت کنید\n۲. مایعات فراوان بنوشید\n۳. از مصرف الکل خودداری کنید\n۴. تا ۲۴ ساعت فعالیت سنگین انجام ندهید\n۵. وعده غذایی مقوی بخورید\n۶. در صورت سرگیجه، فوراً دراز بکشید و پاها را بالا نگه دارید\n۷. بانداژ را تا ۴ ساعت باز نکنید\n\nمصرف مواد غذایی حاوی آهن مانند گوشت قرمز، جگر، اسفناج و حبوبات به جبران سریع‌تر آهن بدن کمک می‌کند.`,
      summary: "راهنمای کامل مراقبت‌های پس از اهدای خون برای بهبود سریع‌تر.",
      author: "دکتر نرگس محمدی",
      category: "راهنما",
      tags: ["مراقبت", "اهدای خون", "بعد از اهدا"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۳/۰۱",
      readCount: 678,
      status: "published",
    },
    {
      id: "MAG-005",
      title: "بیماری‌هایی که با انتقال خون درمان می‌شوند",
      content: `انتقال خون در درمان بسیاری از بیماری‌ها نقش حیاتی دارد:\n\n۱. کم خونی شدید (آنمی)\n۲. تالاسمی\n۳. هموفیلی\n۴. سرطان‌های خونی (لوسمی)\n۵. خونریزی‌های شدید ناشی از تصادفات\n۶. اعمال جراحی بزرگ\n۷. کم خونی داسی شکل\n\nبیماران تالاسمی به طور منظم نیاز به دریافت خون دارند و یکی از بزرگترین مصرف‌کنندگان خون و فرآورده‌های خونی هستند.`,
      summary: "بیماری‌هایی که نیازمند انتقال خون هستند و نقش اهدای خون در نجات جان بیماران.",
      author: "دکتر احمد عباسی",
      category: "آموزشی",
      tags: ["انتقال خون", "بیماری", "درمان"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۳/۱۵",
      readCount: 945,
      status: "published",
    },
    {
      id: "MAG-006",
      title: "تغذیه مناسب قبل از اهدای خون",
      content: `تغذیه مناسب قبل از اهدای خون:\n\n✅ مصرف مواد غذایی زیر توصیه می‌شود:\n• آب و مایعات کافی\n• میوه‌های تازه به خصوص مرکبات\n• سبزیجات برگ سبز\n• غلات کامل\n• پروتئین‌های کم چرب\n\n❌ از مصرف موارد زیر خودداری کنید:\n• غذاهای چرب و سنگین\n• الکل\n• کافئین زیاد\n• غذاهای فرآوری شده\n\nصبح روز اهدا حتماً صبحانه کامل بخورید و آب کافی بنوشید.`,
      summary: "راهنمای تغذیه مناسب قبل از اهدای خون برای داشتن تجربه‌ای بهتر.",
      author: "دکتر فاطمه احمدی",
      category: "سلامت",
      tags: ["تغذیه", "اهدای خون", "سلامت"],
      imageUrl: null,
      publishDate: "۱۴۰۳/۰۴/۰۱",
      readCount: 534,
      status: "published",
    },
  ];

  write(articles);
}

seedMagazine();

export function getArticles(): MagazineArticle[] {
  return read().filter((a) => a.status === "published");
}

export function getArticleById(id: string): MagazineArticle | null {
  return read().find((a) => a.id === id) ?? null;
}

export function getArticlesByCategory(category: string): MagazineArticle[] {
  return getArticles().filter((a) => a.category === category);
}

export function getArticleCategories(): string[] {
  const cats = new Set(getArticles().map((a) => a.category));
  return [...cats];
}

export function incrementArticleReadCount(id: string): void {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) { all[idx].readCount++; write(all); }
}

export function getAllArticles(): MagazineArticle[] {
  return read();
}

export function addArticle(article: MagazineArticle): void {
  const all = read();
  all.push(article);
  write(all);
}

export function updateArticle(id: string, updates: Partial<MagazineArticle>): boolean {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return true;
}

export function clearMagazineDb(): void {
  localStorage.removeItem(DB_KEY);
}
