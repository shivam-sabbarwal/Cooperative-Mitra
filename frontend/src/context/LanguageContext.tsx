"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "kn" | "mr" | "te";

interface Translations {
  appName: string;
  tagline: string;
  home: string;
  chat: string;
  schemes: string;
  legal: string;
  financialLiteracy: string;
  grievance: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  checkEligibility: string;
  fileGrievance: string;
  trackGrievance: string;
  askQuestionPlaceholder: string;
  send: string;
  speaking: string;
  listening: string;
  officialSource: string;
  placeholderSource: string;
  verifiedGovtData: string;
  unableToVerify: string;
  exploreSchemes: string;
  exploreLegal: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "Cooperative Mitra",
    tagline: "Empowering Rural Cooperatives with Multilingual AI Assistance",
    home: "Home",
    chat: "Mitra Chat",
    schemes: "Schemes & Subsidies",
    legal: "Legal & Bye-laws",
    financialLiteracy: "Financial Literacy",
    grievance: "Grievances",
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",
    checkEligibility: "Check Eligibility",
    fileGrievance: "File Grievance",
    trackGrievance: "Track Ticket",
    askQuestionPlaceholder: "Ask about PACS loans, bye-laws, subsidies in your language...",
    send: "Send",
    speaking: "Playing audio...",
    listening: "Listening... Speak now",
    officialSource: "Official Government Record",
    placeholderSource: "Placeholder Content — Not Official",
    verifiedGovtData: "Verified Ministry of Cooperation Data",
    unableToVerify: "Unable to verify from official records",
    exploreSchemes: "Explore Schemes",
    exploreLegal: "Read Cooperative Acts"
  },
  hi: {
    appName: "सहकारी मित्र",
    tagline: "ग्रामीण सहकारी समितियों के लिए बहुभाषी एआई सहायक",
    home: "मुख्य पृष्ठ",
    chat: "मित्र चैट",
    schemes: "योजनाएं व अनुदान",
    legal: "कानून व उप-नियम",
    financialLiteracy: "वित्तीय साक्षरता",
    grievance: "शिकायत निवारण",
    login: "लॉग इन",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    profile: "प्रोफाइल",
    checkEligibility: "पात्रता जांचें",
    fileGrievance: "शिकायत दर्ज करें",
    trackGrievance: "स्थिति देखें",
    askQuestionPlaceholder: "पैक्स ऋण, उप-नियम, खाद सब्सिडी के बारे में अपनी भाषा में पूछें...",
    send: "भेजें",
    speaking: "ऑडियो बज रहा है...",
    listening: "सुन रहा हूँ... बोलिए",
    officialSource: "आधिकारिक सरकारी अभिलेख",
    placeholderSource: "प्रारूप सामग्री — आधिकारिक नहीं",
    verifiedGovtData: "सहकारिता मंत्रालय द्वारा सत्यापित जानकारी",
    unableToVerify: "आधिकारिक अभिलेखों से पुष्टि नहीं हो सकी",
    exploreSchemes: "योजनाएं देखें",
    exploreLegal: "सहकारी कानून पढ़ें"
  },
  kn: {
    appName: "ಸಹಕಾರಿ ಮಿತ್ರ",
    tagline: "ಗ್ರಾಮೀಣ ಸಹಕಾರ ಸಂಘಗಳಿಗೆ ಬಹುಭಾಷಾ ಎಐ ಸಹಾಯಕ",
    home: "ಮುಖಪುಟ",
    chat: "ಮಿತ್ರ ಚಾಟ್",
    schemes: "ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ",
    legal: "ಕಾಯ್ದೆ ಮತ್ತು ಉಪನಿಯಮ",
    financialLiteracy: "ಹಣಕಾಸು ಸಾಕ್ಷರತೆ",
    grievance: "ದೂರು ಪರಿಹಾರ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    logout: "ಲಾಗ್ ಔಟ್",
    profile: "ಪ್ರೊಫೈಲ್",
    checkEligibility: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    fileGrievance: "ದೂರು ದಾಖಲಿಸಿ",
    trackGrievance: "ದೂರಿನ ಸ್ಥಿತಿ",
    askQuestionPlaceholder: "ಪ್ಯಾಕ್ಸ್ ಸಾಲ, ನಿಯಮಗಳು, ಗೊಬ್ಬರ ಸಬ್ಸಿಡಿ ಬಗ್ಗೆ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    speaking: "ಧ್ವನಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ",
    officialSource: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ದಾಖಲೆ",
    placeholderSource: "ಮಾದರಿ ವಿಷಯ — ಅಧಿಕೃತವಲ್ಲ",
    verifiedGovtData: "ಸಹಕಾರ ಸಚಿವಾಲಯದಿಂದ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟ ಮಾಹಿತಿ",
    unableToVerify: "ಅಧಿಕೃತ ದಾಖಲೆಗಳಿಂದ ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ",
    exploreSchemes: "ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    exploreLegal: "ಸಹಕಾರ ಕಾಯ್ದೆಗಳನ್ನು ಓದಿ"
  },
  mr: {
    appName: "सहकारी मित्र",
    tagline: "ग्रामीण सहकारी संस्थांसाठी बहुभाषिक एआय साहाय्यक",
    home: "मुख्य पृष्ठ",
    chat: "मित्र चॅट",
    schemes: "योजना व अनुदाने",
    legal: "कायदे व उपनियम",
    financialLiteracy: "आर्थिक साक्षरता",
    grievance: "तक्रार निवारण",
    login: "लॉगिन",
    register: "नोंदणी",
    logout: "लॉगआउट",
    profile: "प्रोफाइल",
    checkEligibility: "पात्रता तपासा",
    fileGrievance: "तक्रार नोंदवा",
    trackGrievance: "तक्रार स्थिती",
    askQuestionPlaceholder: "पॅक्स कर्ज, उपनियम, खत अनुदान याबद्दल आपल्या भाषेत विचारा...",
    send: "पाठवा",
    speaking: "ऑडिओ वाजत आहे...",
    listening: "ऐकत आहे... बोला",
    officialSource: "अधिकृत शासकीय नोंद",
    placeholderSource: "प्रारूप सामग्री — अधिकृत नाही",
    verifiedGovtData: "सहकार मंत्रालयाद्वारे पडताळलेली माहिती",
    unableToVerify: "अधिकृत नोंदींमधून पडताळणी करता आली नाही",
    exploreSchemes: "योजना पहा",
    exploreLegal: "सहकारी कायदे वाचा"
  },
  te: {
    appName: "సహకార మిత్ర",
    tagline: "గ్రామీణ సహకార సంఘాల కోసం బహుభాషా ఏఐ సహాయకుడు",
    home: "హోమ్",
    chat: "మిత్ర చాట్",
    schemes: "పథకాలు & సబ్సిడీలు",
    legal: "చట్టాలు & ఉపనిబంధనలు",
    financialLiteracy: "ఆర్థిక అవగాహన",
    grievance: "ఫిర్యాదుల పరిష్కారం",
    login: "లాగిన్",
    register: "నమోదు",
    logout: "లాగ్ అవుట్",
    profile: "ప్రొఫైల్",
    checkEligibility: "అర్హతను తనిఖీ చేయండి",
    fileGrievance: "ఫిర్యాదు నమోదు చేయండి",
    trackGrievance: "ఫిర్యాదు స్థితి",
    askQuestionPlaceholder: "ప్యాక్స్ రుణాలు, నిబంధనలు, ఎరువుల సబ్సిడీ గురించి మీ భాషలో అడగండి...",
    send: "పంపండి",
    speaking: "ఆడియో ప్లే అవుతోంది...",
    listening: "వింటున్నాను... మాట్లాడండి",
    officialSource: "అధికారిక ప్రభుత్వ రికార్డు",
    placeholderSource: "నమూనా కంటెంట్ — అధికారికం కాదు",
    verifiedGovtData: "సహకార మంత్రిత్వ శాఖ ద్వారా ధృవీకరించబడిన సమాచారం",
    unableToVerify: "అధికారిక రికార్డుల నుండి ధృవీకరించలేకపోయాము",
    exploreSchemes: "పథకాలను అన్వేషించండి",
    exploreLegal: "సహకార చట్టాలను చదవండి"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("coop_language") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "kn" || saved === "mr" || saved === "te")) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("coop_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
