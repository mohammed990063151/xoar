# النشر التلقائي: GitHub → cPanel

كل `git push` على فرع `main` يشغّل workflow **Build and Deploy to cPanel** وينشر الموقع على `xoraevents.com`.

```
GitHub (main) → Actions build → SSH/rsync → cPanel Passenger → xoraevents.com
```

## مهم: لا تشغّل `npm run build` على cPanel

استضافة cPanel المشتركة تقتل عملية البناء (SIGABRT / نفاد الذاكرة) وتترك مجلد `.next` ناقصاً فيسقط الموقع بـ HTTP 500.

البناء يتم فقط على GitHub Actions. على السيرفر شغّل التطبيق فقط (`server.js` عبر Passenger).

---

## 1) إعداد cPanel (مرة واحدة)

### تطبيق Node.js

1. cPanel → **Setup Node.js App** → **Create Application**
2. الإعدادات:
   - **Node.js version:** 20 أو 24
   - **Application mode:** Production
   - **Application root:** `public_html/xoraevents.com/xoar`
   - **Application URL:** `xoraevents.com`
   - **Application startup file:** `server.js`
3. احفظ ثم **Restart** من cPanel

### المسار على السيرفر

```
/home/cjfyc2evye0k/public_html/xoraevents.com/xoar
```

يجب أن يحتوي المجلد على `.htaccess` و `server.js` (يُرفعان تلقائياً مع أول نشر ناجح).

### SSH

1. cPanel → **SSH Access** → فعّل SSH
2. أنشئ مفتاحاً أو استخدم الموجود
3. سجّل: **Host**, **Port** (غالباً `22`), **Username**

---

## 2) أسرار GitHub (مرة واحدة)

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| السر | الوصف | مثال |
|------|--------|------|
| `SSH_PRIVATE_KEY` | المفتاح الخاص OpenSSH/PEM (سطر كامل مع BEGIN/END) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_HOST` | عنوان السيرفر | `server.example.com` |
| `SSH_PORT` | منفذ SSH | `22` |
| `SSH_USERNAME` | مستخدم cPanel | `cjfyc2evye0k` |
| `FRONTEND_API_KEY` | نفس القيمة في Laravel `xoraplus.com/.env` | `efd29456bd91...` (64 حرف hex) |

**إنشاء مفتاح API:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

ضع نفس القيمة في:
- GitHub Secret `FRONTEND_API_KEY`
- Laravel `xoraplus.com/.env` → `FRONTEND_API_KEY=...`

### سبب شائع لفشل Passenger

`next.prepare()` ينجح لكن Passenger يعيد **Web application could not be started** عندما:

1. `server.js` يستخدم `listen(0.0.0.0)` بدل `listen("passenger")`
2. `node_modules` مرفوعة من GitHub (Node 24) بينما cPanel يشغّل Node مختلف

الحل الحالي: `npm ci` على السيرفر (عبر تفعيل CloudLinux nodevenv أولاً — راجع `scripts/server-npm-ci.sh`) + `server.js` يستخدم `server.listen("passenger")` فعلياً عند التشغيل تحت Passenger (وليس رقم منفذ)، مع fallback لـ `PORT`/3000 فقط عند التشغيل المباشر خارج Passenger.

**حادثة 2026-07-22:** كان `server.js` يستخدم `server.listen(port)` برقم منفذ حتى تحت Passenger — وهذا بالضبط سبب #1 أعلاه. تأكيد ذلك جاء من `passenger.log` نفسه بعد إضافة تسجيل مؤقت لمتغيرات البيئة عند الإقلاع: البيئة الحقيقية التي يشغّل بها Passenger التطبيق تحتوي `PASSENGER_USE_FEEDBACK_FD=true` و`IN_PASSENGER=1` ولا تحتوي `PORT` إطلاقاً — أي أن الإعداد الفعلي هو Phusion Passenger الكلاسيكي (feedback FD)، وليس "CloudLinux Node Selector يمرّر PORT" كما كان مفترضاً سابقاً.

---

## 3) ماذا يفعل الـ workflow؟

1. يتحقق من أسرار SSH
2. `npm ci` + `npm run build` على GitHub
3. يتصل بالسيرفر عبر SSH
4. نسخة احتياطية من النسخة الحية (`.deploy-backup`)
5. رفع: `.next/`, `public/`, `server.js`, `.htaccess`, `package.json`
6. `npm ci --omit=dev` **على السيرفر** (نفس Node الذي يستخدمه Passenger)
7. دمج متغيرات `.env` على السيرفر
8. فحص `next.prepare()` + تشغيل `server.js` قبل إعادة التشغيل
9. إعادة تشغيل Passenger (`tmp/restart.txt`)
10. اختبار الموقع الحي — rollback تلقائي إذا فشل

---

## 4) التشغيل اليدوي

GitHub → **Actions** → **Build and Deploy to cPanel** → **Run workflow**

---

## 5) ملف `.env` على السيرفر

يُنشأ/يُحدَّث تلقائياً من الـ workflow:

```env
API_PROXY_TARGET=https://xoraplus.com
NEXT_PUBLIC_API_URL=https://xoraplus.com
NEXT_PUBLIC_ADMIN_URL=https://xoraplus.com
NEXT_PUBLIC_PORTAL_URL=https://xoraplus.com
NEXT_PUBLIC_SITE_URL=https://xoraevents.com
NEXT_PUBLIC_GTM_ID=GTM-TX7NM96K
FRONTEND_API_KEY=...
```

**مهم:** لا تضف `NODE_ENV` في `.env` على cPanel — يسبب خطأ 500.

---

## 6) استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `Missing GitHub secret` | أضف الأسرار الخمسة من القسم 2 |
| `SSH connection failed` | تحقق من Host/Port/User والمفتاح |
| `Web application could not be started` | cPanel → Node.js → Production + `server.js` |
| الموقع 500 بعد النشر | تأكد `FRONTEND_API_KEY` في GitHub و Laravel |
| النشر فشل ثم رجع للنسخة القديمة | Rollback تلقائي — راجع logs في Actions |

**سجلات cPanel:** Node.js App → **Open Logs** أو `~/logs/*xoraevents*`

---

## 7) الملفات المهمة

| الملف | الدور |
|-------|------|
| `.github/workflows/deploy.yml` | workflow النشر |
| `server.js` | نقطة دخول Passenger |
| `.htaccess` | تفعيل Passenger وحماية `.env` |
| `scripts/verify-deployment.sh` | فحص بعد النشر |
| `scripts/backup-deployment.sh` | نسخة احتياطية |
| `scripts/rollback-deployment.sh` | استرجاع النسخة السابقة |
