"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  FileText,
  Scale,
  AlertTriangle,
  User,
  ArrowRight,
  Loader2,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();

  const [grievances, setGrievances] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const grievanceResult = await api
          .getUserGrievances()
          .catch(() => []);

        const chatResult = await api
          .getChatSessions()
          .catch(() => []);

        setGrievances(grievanceResult || []);
        setChatSessions(chatResult || []);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <User className="w-10 h-10 text-green-700 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-slate-900">
            Cooperative Mitra
          </h1>

          <p className="text-sm text-slate-600 mt-2 mb-5">
            Please log in to access your dashboard.
          </p>

          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const cards = [
    {
      title: "Mitra Chat",
      description:
        "Ask grounded questions about cooperative services, schemes and legal guidance.",
      href: "/chat",
      icon: MessageCircle,
    },
    {
      title: "Schemes & Subsidies",
      description:
        "Explore cooperative welfare schemes and available eligibility information.",
      href: "/schemes",
      icon: FileText,
    },
    {
      title: "Legal Guidance",
      description:
        "Explore cooperative acts, sections and plain-language explanations.",
      href: "/legal",
      icon: Scale,
    },
    {
      title: "Grievance Redressal",
      description:
        "Submit and track cooperative-related grievances.",
      href: "/grievance",
      icon: AlertTriangle,
    },
    {
      title: "My Profile",
      description:
        "Manage your account and preferred language.",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm font-semibold text-green-700 mb-1">
            Cooperative Mitra
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Welcome to your dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Access cooperative services, legal guidance, schemes and grievance
            support.
          </p>
        </section>

        {/* Service Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-green-700" />
                </div>

                <h2 className="font-bold text-slate-900">
                  {card.title}
                </h2>

                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {card.description}
                </p>

                <div className="mt-5 text-sm font-semibold text-green-700 flex items-center gap-1">
                  Open
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* User Data */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex justify-center">
            <Loader2 className="w-7 h-7 text-green-700 animate-spin" />
          </div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Grievances */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <ClipboardList className="w-5 h-5 text-amber-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    My Grievances
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your submitted grievance records
                  </p>
                </div>
              </div>

              {grievances.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No grievances found.
                </p>
              ) : (
                <div className="space-y-3">
                  {grievances.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id || item.ticket_number || index}
                      className="border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-sm text-slate-900">
                          {item.ticket_number ||
                            item.grievance_id ||
                            "Grievance"}
                        </span>

                        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                          {item.status || "Submitted"}
                        </span>
                      </div>

                      {item.subject && (
                        <p className="text-xs text-slate-600 mt-1">
                          {item.subject}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/grievance"
                className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                View Grievances
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Chat History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-green-50 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-green-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Chat History
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your Mitra conversations
                  </p>
                </div>
              </div>

              {chatSessions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No chat sessions found.
                </p>
              ) : (
                <div className="space-y-3">
                  {chatSessions.slice(0, 5).map((session, index) => (
                    <Link
                      key={session.id || session.uuid || index}
                      href="/chat"
                      className="block border border-slate-200 rounded-xl p-3 hover:border-green-300 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {session.title ||
                          session.name ||
                          "Mitra Chat Session"}
                      </p>

                      {session.created_at && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(
                            session.created_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/chat"
                className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Open Mitra Chat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}