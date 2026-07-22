"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerCache } from "@/lib/customer-cache";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountProfilePage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    void customerService.me().then((profile) => {
      setCustomer(profile);
      if (!profile) return;
      setName(profile.name);
      setPhone(profile.phone ?? "");
      setCity(profile.city ?? "");
      setBirthDate(profile.birthDate ?? "");
    });
  }, []);

  async function saveProfile(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      const updated = await customerService.updateProfile(
        {
          name: name.trim(),
          phone: phone.trim() || null,
          city: city.trim() || null,
          birth_date: birthDate || null,
          locale,
        },
        locale,
      );
      setCustomer(updated);
      setMsg(ar ? "تم حفظ الملف الشخصي." : "Profile saved.");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: FormEvent): Promise<void> {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");
    setPwdSaving(true);
    try {
      await customerService.updatePassword(
        currentPassword,
        password,
        passwordConfirmation,
        locale,
      );
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setPwdMsg(ar ? "تم تغيير كلمة المرور." : "Password updated.");
      customerCache.clear();
    } catch (error) {
      setPwdErr(error instanceof Error ? error.message : "Error");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <CustomerSpace
      locale={locale}
      compact
      title={ar ? "حسابي" : "My profile"}
      subtitle={ar ? "أكمل بياناتك وغيّر كلمة المرور" : "Update details and password"}
    >
      {!customer ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-2">
          <form
            onSubmit={(e) => void saveProfile(e)}
            className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#081526] p-6"
          >
            <h2 className="text-lg font-bold text-white">
              {ar ? "البيانات الشخصية" : "Personal details"}
            </h2>
            <label className="block text-xs text-slate-400">
              {ar ? "الاسم" : "Name"}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "البريد" : "Email"}
              <input
                disabled
                value={customer.email}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-500"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "الجوال" : "Phone"}
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
                dir="ltr"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "المدينة" : "City"}
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "تاريخ الميلاد" : "Birth date"}
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
            {msg ? <p className="text-xs text-emerald-300">{msg}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              {saving ? "…" : ar ? "حفظ" : "Save"}
            </button>
          </form>

          <form
            onSubmit={(e) => void savePassword(e)}
            className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#081526] p-6"
          >
            <h2 className="text-lg font-bold text-white">
              {ar ? "تغيير كلمة المرور" : "Change password"}
            </h2>
            <label className="block text-xs text-slate-400">
              {ar ? "كلمة المرور الحالية" : "Current password"}
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "كلمة المرور الجديدة" : "New password"}
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-slate-400">
              {ar ? "تأكيد كلمة المرور" : "Confirm password"}
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            {pwdErr ? <p className="text-xs text-red-400">{pwdErr}</p> : null}
            {pwdMsg ? <p className="text-xs text-emerald-300">{pwdMsg}</p> : null}
            <button
              type="submit"
              disabled={pwdSaving}
              className="w-full rounded-full border border-white/15 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pwdSaving ? "…" : ar ? "تحديث كلمة المرور" : "Update password"}
            </button>
          </form>
        </div>
      )}
    </CustomerSpace>
  );
}
