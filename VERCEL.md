# نشر Vercel (حل نهائي — ~2 دقيقة)

## الطريقة الأفضل (بدون GitHub Secrets)

1. ادخل [vercel.com/new](https://vercel.com/new)
2. **Import** مستودع `mohammed990063151/xoar`
3. Framework: **Next.js** (تلقائي)
4. أضف **Environment Variables** (Production + Preview):

| المتغير | القيمة |
|---------|--------|
| `API_PROXY_TARGET` | `https://xoraplus.com` |
| `FRONTEND_API_KEY` | نفس قيمة `xoraplus.com` Laravel |
| `NEXT_PUBLIC_API_URL` | `https://xoraplus.com` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://xoraplus.com` |
| `NEXT_PUBLIC_PORTAL_URL` | `https://xoraplus.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://xoraevents.com` |
| `NEXT_PUBLIC_GTM_ID` | `GTM-TX7NM96K` |
| `SKIP_API_DURING_BUILD` | `1` |

5. اضغط **Deploy**

بعدها كل `git push` على `main` ينشر تلقائياً من Vercel — **لا تحتاج** `VERCEL_TOKEN`.

---

## إذا أردت علامة خضراء في GitHub Actions

سر **واحد** فقط:

1. Vercel → مشروعك → **Settings** → **Git** → **Deploy Hooks**
2. Name: `github-main` — Branch: `main` — Production
3. انسخ الرابط (يبدأ بـ `https://api.vercel.com/v1/integrations/deploy/...`)
4. GitHub → Repo → **Settings** → **Secrets** → **Actions**
5. New secret: `VERCEL_DEPLOY_HOOK` = الرابط

---

## الدومين

Vercel → **Settings** → **Domains** → أضف `xoraevents.com`

---

## ملاحظة

- workflow الـ cPanel أصبح **يدوي فقط** (Actions → Deploy to cPanel manual)
- لا تضف `FRONTEND_API_KEY` في `NEXT_PUBLIC_*`
