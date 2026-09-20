"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(phoneOrEmail.trim(), password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Invalid phone/email or password. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t.login}</h1>
          <p className="text-sm text-slate-600 mt-1">Cooperative Mitra — Login to your account</p>
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
              Phone Number or Email
            </label>
            <input
              type="text"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              placeholder="e.g. 9876543210 or admin@cooperative.gov.in"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in..." : t.login}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-green-700 hover:underline">
            {t.register}
          </Link>
        </p>
      </div>
    </main>
  );
}
