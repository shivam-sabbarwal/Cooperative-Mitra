"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Home, MessageSquare, FileText, Scale, AlertCircle, Landmark } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t.home, icon: Home },
    { href: "/chat", label: t.chat, icon: MessageSquare, badge: true },
    { href: "/schemes", label: t.schemes, icon: FileText },
    { href: "/legal", label: t.legal, icon: Scale },
    { href: "/financial-literacy", label: t.financialLiteracy, icon: Landmark },
    { href: "/grievance", label: t.grievance, icon: AlertCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 min-h-[var(--mobile-nav-height)] bg-white/95 px-2 py-1 shadow-lg border-t border-slate-200" style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg relative transition-colors ${
                isActive ? "text-coop-700 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-coop-600 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
