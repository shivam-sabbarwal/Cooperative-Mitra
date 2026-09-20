"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

export default function GrievancePage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [category, setCategory] = useState("OTHER");
  const [priority, setPriority] = useState("MEDIUM");
  const [pacsName, setPacsName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Karnataka");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");

  const text = {
    en: {
      title: "Grievance Redressal",
      subtitle:
        "Submit a cooperative-related grievance and receive a reference number for tracking.",
      login: "Please log in to submit a grievance.",
      loginButton: "Login",
      category: "Category",
      priority: "Priority",
      pacs: "PACS / Cooperative Name",
      district: "District",
      state: "State",
      subject: "Subject",
      description: "Description",
      attachment: "Attachment URL (optional)",
      submit: "Submit Grievance",
      submitting: "Submitting...",
      success: "Grievance submitted successfully.",
      reference: "Reference Number",
      status: "Status",
      other: "Other",
      loan: "Loan Disbursement",
      fertilizer: "Fertilizer Supply",
      membership: "Membership Issues",
      corruption: "Corruption / Mismanagement",
      subsidy: "Subsidy Delay",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
      required: "Please complete all required fields.",
    },
    hi: {
      title: "शिकायत निवारण",
      subtitle:
        "सहकारी संस्था से संबंधित शिकायत दर्ज करें और ट्रैकिंग के लिए संदर्भ संख्या प्राप्त करें।",
      login: "शिकायत दर्ज करने के लिए कृपया लॉगिन करें।",
      loginButton: "लॉगिन",
      category: "श्रेणी",
      priority: "प्राथमिकता",
      pacs: "पैक्स / सहकारी संस्था का नाम",
      district: "जिला",
      state: "राज्य",
      subject: "विषय",
      description: "विवरण",
      attachment: "अटैचमेंट URL (वैकल्पिक)",
      submit: "शिकायत दर्ज करें",
      submitting: "दर्ज हो रही है...",
      success: "शिकायत सफलतापूर्वक दर्ज की गई।",
      reference: "संदर्भ संख्या",
      status: "स्थिति",
      other: "अन्य",
      loan: "ऋण वितरण",
      fertilizer: "उर्वरक आपूर्ति",
      membership: "सदस्यता संबंधी समस्या",
      corruption: "भ्रष्टाचार / कुप्रबंधन",
      subsidy: "सब्सिडी में देरी",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      urgent: "अत्यावश्यक",
      required: "कृपया सभी आवश्यक फ़ील्ड भरें।",
    },
    kn: {
      title: "ದೂರು ಪರಿಹಾರ",
      subtitle:
        "ಸಹಕಾರಿ ಸಂಸ್ಥೆಗೆ ಸಂಬಂಧಿಸಿದ ದೂರನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್‌ಗಾಗಿ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಪಡೆಯಿರಿ.",
      login: "ದೂರು ಸಲ್ಲಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
      loginButton: "ಲಾಗಿನ್",
      category: "ವರ್ಗ",
      priority: "ಆದ್ಯತೆ",
      pacs: "ಪ್ಯಾಕ್ಸ್ / ಸಹಕಾರಿ ಸಂಸ್ಥೆಯ ಹೆಸರು",
      district: "ಜಿಲ್ಲೆ",
      state: "ರಾಜ್ಯ",
      subject: "ವಿಷಯ",
      description: "ವಿವರಣೆ",
      attachment: "ಅಟ್ಯಾಚ್‌ಮೆಂಟ್ URL (ಐಚ್ಛಿಕ)",
      submit: "ದೂರು ಸಲ್ಲಿಸಿ",
      submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
      success: "ದೂರು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
      reference: "ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ",
      status: "ಸ್ಥಿತಿ",
      other: "ಇತರೆ",
      loan: "ಸಾಲ ವಿತರಣೆ",
      fertilizer: "ರಸಗೊಬ್ಬರ ಪೂರೈಕೆ",
      membership: "ಸದಸ್ಯತ್ವ ಸಮಸ್ಯೆಗಳು",
      corruption: "ಭ್ರಷ್ಟಾಚಾರ / ದುರುಪಯೋಗ",
      subsidy: "ಸಬ್ಸಿಡಿ ವಿಳಂಬ",
      low: "ಕಡಿಮೆ",
      medium: "ಮಧ್ಯಮ",
      high: "ಹೆಚ್ಚು",
      urgent: "ತುರ್ತು",
      required: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    },
    mr: {
      title: "तक्रार निवारण",
      subtitle:
        "सहकारी संस्थेशी संबंधित तक्रार नोंदवा आणि ट्रॅकिंगसाठी संदर्भ क्रमांक मिळवा.",
      login: "तक्रार नोंदवण्यासाठी कृपया लॉगिन करा.",
      loginButton: "लॉगिन",
      category: "श्रेणी",
      priority: "प्राधान्य",
      pacs: "पॅक्स / सहकारी संस्थेचे नाव",
      district: "जिल्हा",
      state: "राज्य",
      subject: "विषय",
      description: "तपशील",
      attachment: "संलग्नक URL (पर्यायी)",
      submit: "तक्रार सादर करा",
      submitting: "सादर होत आहे...",
      success: "तक्रार यशस्वीरित्या सादर केली गेली.",
      reference: "संदर्भ क्रमांक",
      status: "स्थिती",
      other: "इतर",
      loan: "कर्ज वितरण",
      fertilizer: "खत पुरवठा",
      membership: "सदस्यत्व समस्या",
      corruption: "भ्रष्टाचार / गैरव्यवस्थापन",
      subsidy: "अनुदानातील विलंब",
      low: "कमी",
      medium: "मध्यम",
      high: "जास्त",
      urgent: "तातडीचे",
      required: "कृपया सर्व आवश्यक फील्ड भरा.",
    },
    te: {
      title: "ఫిర్యాదు పరిష్కారం",
      subtitle:
        "సహకార సంస్థకు సంబంధించిన ఫిర్యాదు సమర్పించి ట్రాకింగ్ కోసం రిఫరెన్స్ నంబర్ పొందండి.",
      login: "ఫిర్యాదు నమోదు చేయడానికి దయచేసి లాగిన్ అవ్వండి.",
      loginButton: "లాగిన్",
      category: "వర్గం",
      priority: "ప్రాధాన్యత",
      pacs: "పాక్స్ / సహకార సంఘం పేరు",
      district: "జిల్లా",
      state: "రాష్ట్రం",
      subject: "విషయం",
      description: "వివరణ",
      attachment: "అటాచ్‌మెంట్ URL (ఐచ్ఛికం)",
      submit: "ఫిర్యాదు సమర్పించు",
      submitting: "సమర్పిస్తోంది...",
      success: "ఫిర్యాదు విజయవంతంగా సమర్పించబడింది.",
      reference: "రిఫరెన్స్ నంబర్",
      status: "స్థితి",
      other: "ఇతర",
      loan: "రుణ పంపిణీ",
      fertilizer: "ఎరువుల సరఫరా",
      membership: "సభ్యత్వ సమస్యలు",
      corruption: "అవినీతి / దుర్వినియోగం",
      subsidy: "సబ్సిడీ జాప్యం",
      low: "తక్కువ",
      medium: "మధ్యస్థం",
      high: "అధిక",
      urgent: "అత్యవసరం",
      required: "దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లు పూరించండి.",
    },
  };

  const t = text[language as "en" | "hi" | "kn" | "mr" | "te"] || text.en;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setTicketNumber("");
    setTicketStatus("");

    if (
      !pacsName.trim() ||
      !district.trim() ||
      !state.trim() ||
      !subject.trim() ||
      !description.trim()
    ) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category,
        priority,
        pacs_name: pacsName.trim(),
        district: district.trim(),
        state: state.trim(),
        subject: subject.trim(),
        description: description.trim(),
        ...(attachmentUrl.trim()
          ? { attachment_url: attachmentUrl.trim() }
          : {}),
      };

      const response = await api.submitGrievance(payload);

      setTicketNumber(response?.ticket_number || response?.grievance_id || "");
      setTicketStatus(response?.status || "Submitted");

      setSubject("");
      setDescription("");
      setAttachmentUrl("");
    } catch (err: any) {
      setError(err?.message || "Unable to submit grievance.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <FileText className="w-10 h-10 text-green-700 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t.title}
          </h1>

          <p className="text-sm text-slate-600 mb-6">{t.login}</p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold"
          >
            {t.loginButton}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-200 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            Cooperative Mitra
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            {t.title}
          </h1>

          <p className="mt-2 text-slate-600 max-w-2xl">{t.subtitle}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.category}
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="OTHER">{t.other}</option>
                  <option value="LOAN_DISBURSEMENT">{t.loan}</option>
                  <option value="FERTILIZER_SUPPLY">{t.fertilizer}</option>
                  <option value="MEMBERSHIP_ISSUES">{t.membership}</option>
                  <option value="CORRUPTION_MISMANAGEMENT">
                    {t.corruption}
                  </option>
                  <option value="SUBSIDY_DELAY">{t.subsidy}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.priority}
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="LOW">{t.low}</option>
                  <option value="MEDIUM">{t.medium}</option>
                  <option value="HIGH">{t.high}</option>
                  <option value="URGENT">{t.urgent}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.pacs}
                </label>

                <input
                  value={pacsName}
                  onChange={(e) => setPacsName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.district}
                </label>

                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.state}
                </label>

                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.subject}
                </label>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t.description}
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t.attachment}
              </label>

              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white font-semibold text-sm transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}

              {loading ? t.submitting : t.submit}
            </button>
          </form>
        </div>

        {ticketNumber && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0" />

              <div>
                <h2 className="font-bold text-green-900">{t.success}</h2>

                <div className="mt-3 space-y-1 text-sm text-green-900">
                  <p>
                    <strong>{t.reference}:</strong> {ticketNumber}
                  </p>

                  <p>
                    <strong>{t.status}:</strong> {ticketStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}