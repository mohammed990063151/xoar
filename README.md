# xoar

موقع **Xora** لتنظيم الفعاليات والمؤتمرات والأنشطة الترفيهية — Next.js (App Router)، TypeScript، عربي/إنجليزي، مع أنيميشن (Framer Motion، GSAP، Lenis) ومشاهد ثلاثية الأبعاد (React Three Fiber).

## التشغيل المحلي

```bash
npm install
npm run dev
```

يفتح المشروع على [http://localhost:3000](http://localhost:3000) ويُحوَّل تلقائياً إلى المسار `/ar` أو `/en`.

## البناء للإنتاج

```bash
npm run build
npm start
```

## النشر على cPanel (GitHub Actions)

النشر التلقائي عند الدفع على `main`. الإعداد الكامل (أسرار GitHub + cPanel): **[DEPLOY.md](./DEPLOY.md)**

## المتغيرات البيئية

لا ترفع ملفات `.env` — انسخ من `.env.example` إن وُجد وأضف القيم محلياً.
