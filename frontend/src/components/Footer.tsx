"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  const content = {
    en: {
      services: "Services",
      schemes: "Schemes & Subsidies",
      legal: "Legal & Bye-laws",
      grievance: "Grievance Support",
      chat: "Mitra Assistance",
      information: "Information",
      home: "Home",
      dashboard: "Member Dashboard",
      profile: "My Profile",
      support: "Support",
      supportText:
        "Access cooperative governance information, government schemes, legal guidance and grievance support.",
      project: "Platform Information",
      projectText:
        "Cooperative Mitra provides multilingual guidance for cooperative members and rural communities.",
      disclaimer: "Disclaimer",
      disclaimerText:
        "Information provided through this platform is for general guidance. Please verify important information with the relevant official authority or cooperative office.",
      rights: "Cooperative Mitra",
    },

    hi: {
      services: "सेवाएं",
      schemes: "योजनाएं एवं सब्सिडी",
      legal: "कानूनी जानकारी एवं उपविधियां",
      grievance: "शिकायत सहायता",
      chat: "मित्र सहायता",
      information: "जानकारी",
      home: "मुख्य पृष्ठ",
      dashboard: "सदस्य डैशबोर्ड",
      profile: "मेरी प्रोफ़ाइल",
      support: "सहायता",
      supportText:
        "सहकारी शासन, सरकारी योजनाओं, कानूनी जानकारी और शिकायत सहायता तक पहुंच प्राप्त करें।",
      project: "प्लेटफॉर्म जानकारी",
      projectText:
        "सहकारी मित्र सहकारी सदस्यों और ग्रामीण समुदायों के लिए बहुभाषी मार्गदर्शन प्रदान करता है।",
      disclaimer: "अस्वीकरण",
      disclaimerText:
        "इस प्लेटफॉर्म पर दी गई जानकारी सामान्य मार्गदर्शन के लिए है। महत्वपूर्ण जानकारी संबंधित आधिकारिक प्राधिकरण या सहकारी कार्यालय से सत्यापित करें।",
      rights: "सहकारी मित्र",
    },

    kn: {
      services: "ಸೇವೆಗಳು",
      schemes: "ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯಧನ",
      legal: "ಕಾನೂನು ಮಾಹಿತಿ ಮತ್ತು ಉಪನಿಯಮಗಳು",
      grievance: "ದೂರು ಸಹಾಯ",
      chat: "ಮಿತ್ರ ಸಹಾಯ",
      information: "ಮಾಹಿತಿ",
      home: "ಮುಖಪುಟ",
      dashboard: "ಸದಸ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      support: "ಸಹಾಯ",
      supportText:
        "ಸಹಕಾರಿ ಆಡಳಿತ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ದೂರು ಸಹಾಯವನ್ನು ಪಡೆಯಿರಿ.",
      project: "ವೇದಿಕೆ ಮಾಹಿತಿ",
      projectText:
        "ಸಹಕಾರಿ ಮಿತ್ರವು ಸಹಕಾರಿ ಸದಸ್ಯರು ಮತ್ತು ಗ್ರಾಮೀಣ ಸಮುದಾಯಗಳಿಗೆ ಬಹುಭಾಷಾ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.",
      disclaimer: "ಹಕ್ಕು ನಿರಾಕರಣೆ",
      disclaimerText:
        "ಈ ವೇದಿಕೆಯಲ್ಲಿ ನೀಡಲಾದ ಮಾಹಿತಿಯು ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ಸಂಬಂಧಿತ ಅಧಿಕೃತ ಪ್ರಾಧಿಕಾರ ಅಥವಾ ಸಹಕಾರಿ ಕಚೇರಿಯಿಂದ ಪರಿಶೀಲಿಸಿ.",
      rights: "ಸಹಕಾರಿ ಮಿತ್ರ",
    },

    mr: {
      services: "सेवा",
      schemes: "योजना आणि अनुदान",
      legal: "कायदेशीर माहिती आणि उपविधी",
      grievance: "तक्रार सहाय्य",
      chat: "मित्र सहाय्य",
      information: "माहिती",
      home: "मुख्यपृष्ठ",
      dashboard: "सदस्य डॅशबोर्ड",
      profile: "माझे प्रोफाइल",
      support: "सहाय्य",
      supportText:
        "सहकारी शासन, सरकारी योजना, कायदेशीर मार्गदर्शन आणि तक्रार सहाय्य मिळवा.",
      project: "मंच माहिती",
      projectText:
        "सहकारी मित्र सहकारी सदस्य आणि ग्रामीण समुदायांसाठी बहुभाषिक मार्गदर्शन देतो.",
      disclaimer: "अस्वीकरण",
      disclaimerText:
        "या प्लॅटफॉर्मवर दिलेली माहिती सामान्य मार्गदर्शनासाठी आहे. महत्त्वाची माहिती संबंधित अधिकृत प्राधिकरण किंवा सहकारी कार्यालयाकडून तपासा.",
      rights: "सहकारी मित्र",
    },

    te: {
      services: "సేవలు",
      schemes: "పథకాలు మరియు రాయితీలు",
      legal: "చట్టపరమైన సమాచారం మరియు ఉపనియమాలు",
      grievance: "ఫిర్యాదు సహాయం",
      chat: "మిత్ర సహాయం",
      information: "సమాచారం",
      home: "హోమ్",
      dashboard: "సభ్యుల డ్యాష్‌బోర్డ్",
      profile: "నా ప్రొఫైల్",
      support: "సహాయం",
      supportText:
        "సహకార పాలన, ప్రభుత్వ పథకాలు, చట్టపరమైన మార్గదర్శకాలు మరియు ఫిర్యాదు సహాయాన్ని పొందండి.",
      project: "వేదిక సమాచారం",
      projectText:
        "సహకారి మిత్ర సహకార సభ్యులు మరియు గ్రామీణ సముదాయాలకు బహుభాషా మార్గదర్శకాన్ని అందిస్తుంది.",
      disclaimer: "నిరాకరణ",
      disclaimerText:
        "ఈ ప్లాట్‌ఫారమ్‌లో అందించే సమాచారం సాధారణ మార్గదర్శకత్వం కోసం మాత్రమే. ముఖ్యమైన సమాచారాన్ని సంబంధిత అధికారిక సంస్థ లేదా సహకార కార్యాలయం ద్వారా ధృవీకరించండి.",
      rights: "సహకారి మిత్ర",
    },
  };

  const t = content[language] || content.en;

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-[1180px] px-4">
        {/* Main footer */}
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-slate-600 bg-white">
                <img
                  src="/icon.svg"
                  alt="Cooperative Mitra"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="font-bold text-white">{t.rights}</div>
                <div className="mt-0.5 text-xs text-slate-500">{t.project}</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              {t.supportText}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              {t.services}
            </h3>

            <div className="mt-4 space-y-3">
              <Link
                href="/chat"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.chat}
              </Link>

              <Link
                href="/schemes"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.schemes}
              </Link>

              <Link
                href="/legal"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.legal}
              </Link>

              <Link
                href="/grievance"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.grievance}
              </Link>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              {t.information}
            </h3>

            <div className="mt-4 space-y-3">
              <Link
                href="/"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.home}
              </Link>

              <Link
                href="/dashboard"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.dashboard}
              </Link>

              <Link
                href="/profile"
                className="block text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t.profile}
              </Link>
            </div>
          </div>

          {/* Project */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              {t.project}
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              {t.projectText}
            </p>

          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-800 py-6">
          <div className="border-l-2 border-emerald-700 pl-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
              {t.disclaimer}
            </div>

            <p className="mt-2 max-w-4xl text-xs leading-5 text-slate-500">
              {t.disclaimerText}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-slate-800 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{t.rights}</span>

          <span>
            {t.support}
          </span>
        </div>
      </div>
    </footer>
  );
}
