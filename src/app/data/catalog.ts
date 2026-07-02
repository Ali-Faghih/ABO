/** Public catalog content — not tied to any specific user account. */

export const NEARBY_REQUESTS = [
  { id: 1, hospital: "بیمارستان امام خمینی", bloodType: "O-", urgency: "فوری", distance: "۲.۳ کیلومتر", deadline: "۱۴۰۳/۰۴/۱۰", units: 2 },
  { id: 2, hospital: "بیمارستان شریعتی", bloodType: "A+", urgency: "معمولی", distance: "۵.۱ کیلومتر", deadline: "۱۴۰۳/۰۴/۱۵", units: 1 },
  { id: 3, hospital: "بیمارستان مهراد", bloodType: "B+", urgency: "فوری", distance: "۷.۸ کیلومتر", deadline: "۱۴۰۳/۰۴/۰۸", units: 3 },
  { id: 4, hospital: "سازمان انتقال خون", bloodType: "AB-", urgency: "معمولی", distance: "۱۰.۲ کیلومتر", deadline: "۱۴۰۳/۰۴/۲۰", units: 1 },
];

export const RECOMMENDED_HOSPITALS = [
  { id: 1, name: "سازمان انتقال خون", specialty: "اهدای خون تخصصی", distance: "۳.۵ کیلومتر", rating: 4.9 },
  { id: 2, name: "بیمارستان امام خمینی", specialty: "اورژانس، جراحی", distance: "۲.۳ کیلومتر", rating: 4.8 },
  { id: 3, name: "بیمارستان توس", specialty: "داخلی، اطفال", distance: "۶.۱ کیلومتر", rating: 4.6 },
];

export const ARTICLES = [
  { id: 1, title: "همه چیز درباره اهدای خون", category: "آموزشی", readTime: "۵ دقیقه", date: "۱ تیر ۱۴۰۳", featured: true },
  { id: 2, title: "شرایط اهدای خون چیست؟", category: "سلامت", readTime: "۳ دقیقه", date: "۲۵ خرداد ۱۴۰۳", featured: false },
  { id: 3, title: "فواید اهدای خون برای سلامتی", category: "سلامت", readTime: "۴ دقیقه", date: "۱۸ خرداد ۱۴۰۳", featured: false },
  { id: 4, title: "مراقبت‌های بعد از اهدا", category: "مراقبت", readTime: "۳ دقیقه", date: "۱۰ خرداد ۱۴۰۳", featured: false },
  { id: 5, title: "تفاوت گروه‌های خونی", category: "علمی", readTime: "۶ دقیقه", date: "۵ خرداد ۱۴۰۳", featured: false },
];

export const MATCHING_DONORS = [
  { id: 1, name: "علی محمدی", bloodType: "O-", distance: "۲ کیلومتر", available: true, age: 28, donations: 7 },
  { id: 2, name: "سارا حسینی", bloodType: "O-", distance: "۵ کیلومتر", available: true, age: 24, donations: 3 },
  { id: 3, name: "محمد رضایی", bloodType: "O-", distance: "۷ کیلومتر", available: true, age: 35, donations: 12 },
  { id: 4, name: "رضا کریمی", bloodType: "O-", distance: "۱۱ کیلومتر", available: false, age: 31, donations: 5 },
];

export const ACTIVE_REQUESTS = [
  { id: 1, bloodType: "O-", units: 2, deadline: "۱۴۰۳/۰۴/۱۰", matched: 2, status: "active" as const, urgency: "فوری" },
  { id: 2, bloodType: "A+", units: 1, deadline: "۱۴۰۳/۰۴/۱۵", matched: 5, status: "active" as const, urgency: "معمولی" },
  { id: 3, bloodType: "AB+", units: 3, deadline: "۱۴۰۳/۰۳/۲۸", matched: 3, status: "completed" as const, urgency: "معمولی" },
];

export const CHAT_MESSAGES = [
  { id: 1, from: "other" as const, text: "سلام، آیا آمادگی اهدای خون دارید؟", time: "۱۰:۰۰" },
  { id: 2, from: "me" as const, text: "بله، گروه خونی O+ دارم و آماده‌ام", time: "۱۰:۰۵" },
  { id: 3, from: "other" as const, text: "عالی! آیا فردا ساعت ۹ می‌توانید تشریف بیاورید؟", time: "۱۰:۱۵" },
  { id: 4, from: "other" as const, text: "آدرس: خیابان ولیعصر، بیمارستان امام خمینی، طبقه اول", time: "۱۰:۱۶" },
  { id: 5, from: "me" as const, text: "بسیار خب، فردا ساعت ۹ حضور خواهم داشت", time: "۱۰:۳۰" },
  { id: 6, from: "other" as const, text: "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", time: "۱۰:۳۵" },
];
