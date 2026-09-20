"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [pacsName, setPacsName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !fullName.trim() || !password.trim()) {
      setError("Please fill in Phone, Full Name, and Password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        phone: phone.trim(),
        full_name: fullName.trim(),
        password,
        role: "MEMBER",
        language,
        state: "Karnataka",
      };
      if (email.trim()) payload.email = email.trim();
      if (district.trim()) payload.district = district.trim();
      if (pacsName.trim()) payload.pacs_name = pacsName.trim();

      const success = await register(payload);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Registration failed. Phone number may already be registered.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t.register}</h1>
          <p className="text-sm text-slate-600 mt-1">Cooperative Mitra — Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password (min 6 chars) *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. farmer@example.in"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                District (optional)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Shivamogga"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                PACS Name (opt.)
              </label>
              <input
                type="text"
                value={pacsName}
                onChange={(e) => setPacsName(e.target.value)}
                placeholder="e.g. Shivamogga PACS"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Registering..." : t.register}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </main>
  );
}
