"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Save, Loader2, LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        const profile = data?.data || data?.user || data;

        setName(profile?.name || profile?.full_name || "");
        setPhone(profile?.phone || profile?.phone_number || "");
        setEmail(profile?.email || "");
      } catch (err: any) {
        setError(err?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload: { full_name?: string; email?: string } = {};
      if (name.trim()) payload.full_name = name.trim();
      if (email.trim()) payload.email = email.trim();

      const success = await updateUser(payload);
      if (success) {
        setMessage("Profile updated successfully.");
      } else {
        setError("Unable to update profile.");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md w-full">
          <User className="w-10 h-10 text-green-700 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-slate-900">
            Profile
          </h1>

          <p className="text-sm text-slate-600 mt-2 mb-5">
            Please log in to view your profile.
          </p>

          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-xl bg-green-700 text-white font-semibold"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <User className="w-6 h-6 text-green-700" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Profile
              </h1>

              <p className="text-sm text-slate-600">
                Manage your Cooperative Mitra account.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-green-700" />
            <h2 className="font-bold text-slate-900">
              Account Information
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone
              </label>

              <input
                value={phone}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Preferred Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "en" | "hi" | "kn" | "mr" | "te")
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="mr">मराठी</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 p-3 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 p-3 text-sm">
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white font-semibold text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

            </div>

          </form>
        </div>

      </div>
    </main>
  );
}