"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

import { useLanguage, Language } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const brandTranslations: Record<
  Language,
  {
    name: string;
    subtitle: string;
  }
> = {
  en: {
    name: "Cooperative Mitra",
    subtitle: "Cooperative Governance & Member Services",
  },
  hi: {
    name: "सहकारी मित्र",
    subtitle: "सहकारी शासन एवं सदस्य सेवाएं",
  },
  kn: {
    name: "ಸಹಕಾರಿ ಮಿತ್ರ",
    subtitle: "ಸಹಕಾರಿ ಆಡಳಿತ ಮತ್ತು ಸದಸ್ಯರ ಸೇವೆಗಳು",
  },
  mr: {
    name: "सहकारी मित्र",
    subtitle: "सहकारी शासन आणि सदस्य सेवा",
  },
  te: {
    name: "సహకారి మిత్ర",
    subtitle: "సహకార పాలన మరియు సభ్యుల సేవలు",
  },
};

const languageLabels: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  mr: "मराठी",
  te: "తెలుగు",
};

const dashboardLabels: Record<Language, string> = {
  en: "Dashboard",
  hi: "डैशबोर्ड",
  kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  mr: "डॅशबोर्ड",
  te: "డ్యాష్‌బోర్డ్",
};

const navItems = [
  {
    key: "home",
    href: "/",
  },
  {
    key: "chat",
    href: "/chat",
  },
  {
    key: "schemes",
    href: "/schemes",
  },
  {
    key: "legal",
    href: "/legal",
  },
  {
    key: "financialLiteracy",
    href: "/financial-literacy",
  },
  {
    key: "grievance",
    href: "/grievance",
  },
] as const;

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const brand =
    brandTranslations[language] || brandTranslations.en;

  const getNavLabel = (key: keyof typeof t) => {
    return t[key] as string;
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLanguageOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      {/* =====================================================
          TOP SERVICE STRIP
      ===================================================== */}
      <div className="hidden border-b border-slate-200 bg-[#f8faf9] md:block">
        <div className="mx-auto flex h-[30px] max-w-[1240px] items-center px-5">
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span>{brand.subtitle}</span>

            <span className="text-slate-300">|</span>

            <span>{t.tagline}</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-5">
          <div className="flex min-h-[78px] items-center">

            {/* =================================================
                BRAND
            ================================================= */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:w-[285px] lg:flex-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[#b9e7ca] bg-white">
                <img
                  src="/icon.svg"
                  alt="Cooperative Mitra"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="whitespace-nowrap text-[17px] font-bold leading-[22px] text-slate-900">
                  {brand.name}
                </div>

                <div className="mt-[3px] hidden whitespace-nowrap text-[10px] leading-[15px] text-slate-500 sm:block">
                  {brand.subtitle}
                </div>
              </div>
            </Link>

            {/* =================================================
                DESKTOP NAV
            ================================================= */}
            <nav
              className="hidden flex-1 items-center justify-center lg:flex"
              aria-label="Main navigation"
            >
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      flex
                      min-h-[46px]
                      items-center
                      justify-center
                      px-4
                      text-center
                      text-[14px]
                      font-medium
                      leading-[20px]
                      text-slate-700
                      transition
                      hover:bg-[#f2f7f4]
                      hover:text-[#16824c]
                    "
                  >
                    {getNavLabel(item.key)}
                  </Link>
                ))}
              </div>
            </nav>

            {/* =================================================
                RIGHT CONTROLS
            ================================================= */}
            <div className="hidden w-[300px] shrink-0 items-center justify-end gap-2 lg:flex">

              {/* LANGUAGE */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLanguageOpen((value) => !value);
                    setUserOpen(false);
                  }}
                  className="
                    flex
                    h-[42px]
                    items-center
                    gap-2
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-[14px]
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <span>{languageLabels[language]}</span>

                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {languageOpen && (
                  <div className="absolute right-0 top-[46px] z-50 w-44 border border-slate-200 bg-white py-1 shadow-lg">
                    {(Object.keys(languageLabels) as Language[]).map(
                      (lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() =>
                            handleLanguageChange(lang)
                          }
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                            language === lang
                              ? "bg-[#f0faf4] font-semibold text-[#16824c]"
                              : "text-slate-700"
                          }`}
                        >
                          {languageLabels[lang]}

                          {language === lang && (
                            <span className="text-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* USER / LOGIN */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen((value) => !value);
                      setLanguageOpen(false);
                    }}
                    className="
                      flex
                      h-[42px]
                      items-center
                      gap-2
                      px-3
                      text-[14px]
                      font-semibold
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <User className="h-4 w-4" />

                    <span className="max-w-[105px] truncate">
                      {user.full_name || user.email}
                    </span>

                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {userOpen && (
                    <div className="absolute right-0 top-[46px] z-50 w-52 border border-slate-200 bg-white py-1 shadow-lg">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {dashboardLabels[language]}
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4" />
                        {t.profile}
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="
                      flex
                      h-[42px]
                      items-center
                      gap-2
                      px-3
                      text-[14px]
                      font-semibold
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <LogIn className="h-4 w-4" />

                    <span>{t.login}</span>
                  </Link>

                  <Link
                    href="/register"
                    className="
                      flex
                      h-[42px]
                      items-center
                      gap-2
                      bg-[#16824c]
                      px-4
                      text-[14px]
                      font-semibold
                      text-white
                      hover:bg-[#126d40]
                    "
                  >
                    <UserPlus className="h-4 w-4" />

                    <span>{t.register}</span>
                  </Link>
                </>
              )}
            </div>

            {/* =================================================
                MOBILE CONTROLS
            ================================================= */}
            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <label className="sr-only" htmlFor="mobile-site-language">{languageLabels[language]}</label>
              <select
                id="mobile-site-language"
                value={language}
                onChange={(event) => handleLanguageChange(event.target.value as Language)}
                className="min-h-[40px] max-w-[104px] border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
                aria-label={languageLabels[language]}
              >
                {(Object.keys(languageLabels) as Language[]).map((lang) => (
                  <option key={lang} value={lang}>{languageLabels[lang]}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  setMobileOpen((value) => !value)
                }
                className="border border-slate-200 p-2 text-slate-700"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              MOBILE MENU
          ================================================= */}
          {mobileOpen && (
            <div className="border-t border-slate-200 py-3 lg:hidden">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-slate-100 px-2 py-3 text-sm font-medium leading-6 text-slate-700 hover:bg-[#f2f7f4] hover:text-[#16824c]"
                  >
                    {getNavLabel(item.key)}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {languageLabels[language]}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(languageLabels) as Language[]).map(
                    (lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() =>
                          handleLanguageChange(lang)
                        }
                        className={`border px-3 py-2.5 text-left text-sm ${
                          language === lang
                            ? "border-[#b9e7ca] bg-[#f0faf4] font-semibold text-[#16824c]"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        {languageLabels[lang]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-2 py-2 text-sm text-slate-600">
                      Signed in as{" "}
                      <span className="font-semibold text-slate-900">
                        {user.full_name || user.email}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-2 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabels[language]}
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-2 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" />
                      {t.profile}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-2 py-3 text-left text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                    >
                      <LogIn className="h-4 w-4" />
                      {t.login}
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 bg-[#16824c] px-3 py-2.5 text-sm font-semibold text-white"
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.register}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
