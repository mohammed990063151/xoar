# النشر التلقائي: GitHub → cPanel

كل `git push` على فرع `main` يشغّل workflow **Build and Deploy to cPanel** وينشر الموقع على `xoraevents.com`.

```
GitHub (main) → Actions build → SSH/rsync → cPanel Passenger → xoraevents.com
```

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

---

## 3) ماذا يفعل الـ workflow؟

1. يتحقق من الأسرار
2. `npm ci` + `npm run build` على GitHub
3. يتصل بالسيرفر عبر SSH
4. نسخة احتياطية من النسخة الحية (`.deploy-backup`)
5. رفع: `.next/`, `public/`, `node_modules/`, `server.js`, `.htaccess`, `.env`
6. دمج متغيرات `.env` على السيرفر (بدون مسح الموجود)
7. فحص `next.prepare()` قبل إعادة التشغيل
8. إعادة تشغيل Passenger (`tmp/restart.txt`)
9. اختبار الموقع الحي — rollback تلقائي إذا فشل

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
