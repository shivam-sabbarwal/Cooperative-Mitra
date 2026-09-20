"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  FileText,
  Scale,
  MessageSquare,
  Megaphone,
  ShieldCheck,
  Users,
  ChevronRight,
  Landmark,
  LayoutGrid,
} from "lucide-react";

import { useLanguage, Language } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import MitraChatWidget from "@/components/MitraChatWidget";

interface Scheme {
  id: number;
  scheme_code?: string;
  title_en?: string;
  title_hi?: string;
  title_kn?: string;
  title_mr?: string;
  title_te?: string;
  description_en?: string;
  description_hi?: string;
  description_kn?: string;
  description_mr?: string;
  description_te?: string;
  category?: string;
  source_type?: string;
  official_source_url?: string;
}

const translations: Record<
  Language,
  {
    eyebrow: string;
    heroTitle: string;
    heroTitle2: string;
    heroDescription: string;
    searchPlaceholder: string;
    search: string;
    popular: string;
    membership: string;
    schemes: string;
    elections: string;
    bylaws: string;
    grievances: string;
    exploreSchemes: string;
    getHelp: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesDescription: string;
    mitraTitle: string;
    mitraDescription: string;
    mitraAction: string;
    schemesTitle: string;
    schemesDescription: string;
    viewAll: string;
    viewDetails: string;
    legalTitle: string;
    legalDescription: string;
    legalAction: string;
    grievanceTitle: string;
    grievanceDescription: string;
    grievanceAction: string;
    announcements: string;
    announcementOne: string;
    announcementTwo: string;
    announcementThree: string;
    resourceTitle: string;
    resourceDescription: string;
    languages: string;
    guidance: string;
    cooperativeServices: string;
    memberServices: string;
    governmentPrograms: string;
    actsBylaws: string;
    multilingualSupport: string;
    people: string;
    cooperation: string;
    progress: string;
    strongerCooperatives: string;
    brighterCommunities: string;
    cooperativeMembers: string;
    verifiedInformation: string;
    multilingual: string;
    newLabel: string;
    noticeLabel: string;
    updateLabel: string;
    noSchemes: string;
  }
> = {
  en: {
    eyebrow: "COOPERATIVES FOR A STRONGER TOMORROW",
    heroTitle: "Together for Stronger",
    heroTitle2: "Cooperatives & Communities",
    heroDescription:
      "Access government schemes, legal guidance and grievance support for PACS and cooperative societies in your language.",
    searchPlaceholder:
      "Search schemes, laws, documents or ask a question...",
    search: "Search",
    popular: "Popular",
    membership: "Membership",
    schemes: "Schemes",
    elections: "Elections",
    bylaws: "Bye-laws",
    grievances: "Grievances",
    exploreSchemes: "Explore Schemes",
    getHelp: "Get Help Now",
    servicesEyebrow: "MEMBER SERVICES",
    servicesTitle: "Everything You Need in One Place",
    servicesDescription:
      "Find information, access services and get support for your cooperative journey.",
    mitraTitle: "Mitra Chat",
    mitraDescription:
      "Get answers and guidance in your preferred language.",
    mitraAction: "Chat with Mitra",
    schemesTitle: "Schemes & Subsidies",
    schemesDescription:
      "Discover government schemes, subsidies and support available to cooperatives.",
    viewAll: "View All",
    viewDetails: "View Details",
    legalTitle: "Legal & Bye-laws",
    legalDescription:
      "Access cooperative acts, rules, sections and model bye-laws.",
    legalAction: "View Legal Resources",
    grievanceTitle: "File a Grievance",
    grievanceDescription:
      "Report cooperative issues and track your grievance transparently.",
    grievanceAction: "File a Grievance",
    announcements: "Announcements",
    announcementOne: "Cooperative schemes and programme information",
    announcementTwo: "Updated legal and bye-law resources",
    announcementThree: "Member grievance support available",
    resourceTitle: "Cooperative Resources",
    resourceDescription:
      "Access verified information about schemes, laws and cooperative services.",
    languages: "5 Languages",
    guidance: "Guidance with Mitra",
    cooperativeServices: "Cooperative Services",
    memberServices: "Member-focused services",
    governmentPrograms: "Government programmes",
    actsBylaws: "Acts and bye-laws",
    multilingualSupport: "Multilingual support",
    people: "People",
    cooperation: "Cooperation",
    progress: "Progress",
    strongerCooperatives: "Stronger cooperatives.",
    brighterCommunities: "Brighter communities.",
    cooperativeMembers: "Cooperative members",
    verifiedInformation: "Verified information",
    multilingual: "Multilingual support",
    newLabel: "New",
    noticeLabel: "Notice",
    updateLabel: "Update",
    noSchemes: "No schemes available at the moment.",
  },

  hi: {
    eyebrow: "सहकार से मजबूत भविष्य",
    heroTitle: "मजबूत सहकारिता के लिए",
    heroTitle2: "मजबूत समुदाय",
    heroDescription:
      "PACS और सहकारी समितियों के लिए सरकारी योजनाओं, कानूनी जानकारी और शिकायत सहायता अपनी भाषा में प्राप्त करें।",
    searchPlaceholder:
      "योजनाएं, कानून, दस्तावेज़ खोजें या प्रश्न पूछें...",
    search: "खोजें",
    popular: "लोकप्रिय",
    membership: "सदस्यता",
    schemes: "योजनाएं",
    elections: "चुनाव",
    bylaws: "उप-नियम",
    grievances: "शिकायतें",
    exploreSchemes: "योजनाएं देखें",
    getHelp: "सहायता प्राप्त करें",
    servicesEyebrow: "सदस्य सेवाएं",
    servicesTitle: "आपकी आवश्यक सभी सेवाएं एक जगह",
    servicesDescription:
      "सहकारी क्षेत्र से जुड़ी जानकारी, सेवाएं और सहायता एक ही स्थान पर प्राप्त करें।",
    mitraTitle: "मित्र चैट",
    mitraDescription:
      "अपनी पसंदीदा भाषा में उत्तर और मार्गदर्शन प्राप्त करें।",
    mitraAction: "मित्र से बात करें",
    schemesTitle: "योजनाएं और सब्सिडी",
    schemesDescription:
      "सहकारी संस्थाओं के लिए उपलब्ध सरकारी योजनाएं और सहायता देखें।",
    viewAll: "सभी देखें",
    viewDetails: "विवरण देखें",
    legalTitle: "कानून और उप-नियम",
    legalDescription:
      "सहकारी अधिनियम, नियम, धाराएं और मॉडल उप-नियम देखें।",
    legalAction: "कानूनी संसाधन देखें",
    grievanceTitle: "शिकायत दर्ज करें",
    grievanceDescription:
      "सहकारी समस्या की रिपोर्ट करें और अपनी शिकायत की स्थिति देखें।",
    grievanceAction: "शिकायत दर्ज करें",
    announcements: "सूचनाएं",
    announcementOne: "सहकारी योजनाओं और कार्यक्रमों की जानकारी",
    announcementTwo: "कानूनी और उप-नियम संसाधन अपडेट किए गए",
    announcementThree: "सदस्य शिकायत सहायता उपलब्ध",
    resourceTitle: "सहकारी संसाधन",
    resourceDescription:
      "योजनाओं, कानूनों और सहकारी सेवाओं की सत्यापित जानकारी प्राप्त करें।",
    languages: "5 भाषाएं",
    guidance: "मित्र सहायता",
    cooperativeServices: "सहकारी सेवाएं",
    memberServices: "सदस्य-केंद्रित सेवाएं",
    governmentPrograms: "सरकारी कार्यक्रम",
    actsBylaws: "अधिनियम और उप-नियम",
    multilingualSupport: "बहुभाषी सहायता",
    people: "लोग",
    cooperation: "सहकार",
    progress: "प्रगति",
    strongerCooperatives: "मजबूत सहकारिता।",
    brighterCommunities: "बेहतर समुदाय।",
    cooperativeMembers: "सहकारी सदस्य",
    verifiedInformation: "सत्यापित जानकारी",
    multilingual: "बहुभाषी सहायता",
    newLabel: "नया",
    noticeLabel: "सूचना",
    updateLabel: "अपडेट",
    noSchemes: "फिलहाल कोई योजना उपलब्ध नहीं है।",
  },

  kn: {
    eyebrow: "ಬಲವಾದ ಸಹಕಾರಕ್ಕಾಗಿ ಒಟ್ಟಾಗಿ",
    heroTitle: "ಬಲವಾದ ಸಹಕಾರ",
    heroTitle2: "ಮತ್ತು ಸಮುದಾಯಗಳು",
    heroDescription:
      "PACS ಮತ್ತು ಸಹಕಾರಿ ಸಂಸ್ಥೆಗಳಿಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಕಾನೂನು ಮಾಹಿತಿ ಮತ್ತು ದೂರು ಸಹಾಯವನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಪಡೆಯಿರಿ.",
    searchPlaceholder:
      "ಯೋಜನೆಗಳು, ಕಾನೂನುಗಳು, ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ...",
    search: "ಹುಡುಕಿ",
    popular: "ಜನಪ್ರಿಯ",
    membership: "ಸದಸ್ಯತ್ವ",
    schemes: "ಯೋಜನೆಗಳು",
    elections: "ಚುನಾವಣೆ",
    bylaws: "ಉಪನಿಯಮಗಳು",
    grievances: "ದೂರುಗಳು",
    exploreSchemes: "ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    getHelp: "ಸಹಾಯ ಪಡೆಯಿರಿ",
    servicesEyebrow: "ಸದಸ್ಯ ಸೇವೆಗಳು",
    servicesTitle: "ನಿಮಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ",
    servicesDescription:
      "ಸಹಕಾರಿ ಕ್ಷೇತ್ರಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ, ಸೇವೆಗಳು ಮತ್ತು ಸಹಾಯವನ್ನು ಪಡೆಯಿರಿ.",
    mitraTitle: "ಮಿತ್ರ ಚಾಟ್",
    mitraDescription:
      "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.",
    mitraAction: "ಮಿತ್ರರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    schemesTitle: "ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯಧನ",
    schemesDescription:
      "ಸಹಕಾರಿ ಸಂಸ್ಥೆಗಳಿಗೆ ಲಭ್ಯವಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    viewAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    legalTitle: "ಕಾನೂನು ಮತ್ತು ಉಪನಿಯಮಗಳು",
    legalDescription:
      "ಸಹಕಾರಿ ಕಾಯ್ದೆಗಳು, ನಿಯಮಗಳು ಮತ್ತು ಮಾದರಿ ಉಪನಿಯಮಗಳನ್ನು ನೋಡಿ.",
    legalAction: "ಕಾನೂನು ಸಂಪನ್ಮೂಲಗಳು",
    grievanceTitle: "ದೂರು ಸಲ್ಲಿಸಿ",
    grievanceDescription:
      "ಸಹಕಾರಿ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ ಮತ್ತು ದೂರಿನ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
    grievanceAction: "ದೂರು ಸಲ್ಲಿಸಿ",
    announcements: "ಸೂಚನೆಗಳು",
    announcementOne: "ಸಹಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳ ಮಾಹಿತಿ",
    announcementTwo: "ಕಾನೂನು ಮತ್ತು ಉಪನಿಯಮ ಸಂಪನ್ಮೂಲಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ",
    announcementThree: "ಸದಸ್ಯರ ದೂರು ಸಹಾಯ ಲಭ್ಯವಿದೆ",
    resourceTitle: "ಸಹಕಾರಿ ಸಂಪನ್ಮೂಲಗಳು",
    resourceDescription:
      "ಯೋಜನೆಗಳು, ಕಾನೂನುಗಳು ಮತ್ತು ಸೇವೆಗಳ ಪರಿಶೀಲಿತ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ.",
    languages: "5 ಭಾಷೆಗಳು",
    guidance: "ಮಿತ್ರ ಮಾರ್ಗದರ್ಶನ",
    cooperativeServices: "ಸಹಕಾರಿ ಸೇವೆಗಳು",
    memberServices: "ಸದಸ್ಯ ಸೇವೆಗಳು",
    governmentPrograms: "ಸರ್ಕಾರಿ ಕಾರ್ಯಕ್ರಮಗಳು",
    actsBylaws: "ಕಾಯ್ದೆಗಳು ಮತ್ತು ಉಪನಿಯಮಗಳು",
    multilingualSupport: "ಬಹುಭಾಷಾ ಸಹಾಯ",
    people: "ಜನರು",
    cooperation: "ಸಹಕಾರ",
    progress: "ಪ್ರಗತಿ",
    strongerCooperatives: "ಬಲವಾದ ಸಹಕಾರಿಗಳು.",
    brighterCommunities: "ಉತ್ತಮ ಸಮುದಾಯಗಳು.",
    cooperativeMembers: "ಸಹಕಾರಿ ಸದಸ್ಯರು",
    verifiedInformation: "ಪರಿಶೀಲಿತ ಮಾಹಿತಿ",
    multilingual: "ಬಹುಭಾಷಾ ಸಹಾಯ",
    newLabel: "ಹೊಸ",
    noticeLabel: "ಸೂಚನೆ",
    updateLabel: "ನವೀಕರಣ",
    noSchemes: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಯೋಜನೆ ಲಭ್ಯವಿಲ್ಲ.",
  },

  mr: {
    eyebrow: "मजबूत सहकारासाठी एकत्र",
    heroTitle: "मजबूत सहकार",
    heroTitle2: "आणि मजबूत समुदाय",
    heroDescription:
      "PACS आणि सहकारी संस्थांसाठी सरकारी योजना, कायदेशीर माहिती आणि तक्रार सहाय्य आपल्या भाषेत मिळवा.",
    searchPlaceholder:
      "योजना, कायदे, कागदपत्रे शोधा किंवा प्रश्न विचारा...",
    search: "शोधा",
    popular: "लोकप्रिय",
    membership: "सदस्यत्व",
    schemes: "योजना",
    elections: "निवडणुका",
    bylaws: "उपनियम",
    grievances: "तक्रारी",
    exploreSchemes: "योजना पहा",
    getHelp: "मदत मिळवा",
    servicesEyebrow: "सदस्य सेवा",
    servicesTitle: "आपल्याला आवश्यक सर्व काही एका ठिकाणी",
    servicesDescription:
      "सहकारी क्षेत्राशी संबंधित माहिती, सेवा आणि सहाय्य मिळवा.",
    mitraTitle: "मित्र चॅट",
    mitraDescription:
      "आपल्या पसंतीच्या भाषेत उत्तरे आणि मार्गदर्शन मिळवा.",
    mitraAction: "मित्राशी बोला",
    schemesTitle: "योजना आणि अनुदान",
    schemesDescription:
      "सहकारी संस्थांसाठी उपलब्ध सरकारी योजना आणि सहाय्य शोधा.",
    viewAll: "सर्व पहा",
    viewDetails: "तपशील पहा",
    legalTitle: "कायदे आणि उपनियम",
    legalDescription:
      "सहकारी कायदे, नियम, कलमे आणि नमुना उपनियम पहा.",
    legalAction: "कायदेशीर संसाधने",
    grievanceTitle: "तक्रार नोंदवा",
    grievanceDescription:
      "सहकारी समस्येची नोंद करा आणि तक्रारीची स्थिती पहा.",
    grievanceAction: "तक्रार नोंदवा",
    announcements: "सूचना",
    announcementOne: "सहकारी योजना आणि कार्यक्रमांची माहिती",
    announcementTwo: "कायदे आणि उपनियम संसाधने अद्ययावत",
    announcementThree: "सदस्य तक्रार सहाय्य उपलब्ध",
    resourceTitle: "सहकारी संसाधने",
    resourceDescription:
      "योजना, कायदे आणि सहकारी सेवांची पडताळलेली माहिती मिळवा.",
    languages: "5 भाषा",
    guidance: "मित्र मार्गदर्शन",
    cooperativeServices: "सहकारी सेवा",
    memberServices: "सदस्य-केंद्रित सेवा",
    governmentPrograms: "सरकारी कार्यक्रम",
    actsBylaws: "कायदे आणि उपनियम",
    multilingualSupport: "बहुभाषिक सहाय्य",
    people: "लोक",
    cooperation: "सहकार",
    progress: "प्रगती",
    strongerCooperatives: "मजबूत सहकार.",
    brighterCommunities: "उज्ज्वल समुदाय.",
    cooperativeMembers: "सहकारी सदस्य",
    verifiedInformation: "पडताळलेली माहिती",
    multilingual: "बहुभाषिक सहाय्य",
    newLabel: "नवीन",
    noticeLabel: "सूचना",
    updateLabel: "अपडेट",
    noSchemes: "सध्या कोणतीही योजना उपलब्ध नाही.",
  },

  te: {
    eyebrow: "బలమైన సహకారాల కోసం కలిసి",
    heroTitle: "బలమైన సహకారాలు",
    heroTitle2: "మరియు సమాజాలు",
    heroDescription:
      "PACS మరియు సహకార సంస్థల కోసం ప్రభుత్వ పథకాలు, చట్టపరమైన సమాచారం మరియు ఫిర్యాదు సహాయాన్ని మీ భాషలో పొందండి.",
    searchPlaceholder:
      "పథకాలు, చట్టాలు, పత్రాలు వెతకండి లేదా ప్రశ్న అడగండి...",
    search: "వెతకండి",
    popular: "ప్రాచుర్యం",
    membership: "సభ్యత్వం",
    schemes: "పథకాలు",
    elections: "ఎన్నికలు",
    bylaws: "ఉపనియమాలు",
    grievances: "ఫిర్యాదులు",
    exploreSchemes: "పథకాలను చూడండి",
    getHelp: "సహాయం పొందండి",
    servicesEyebrow: "సభ్య సేవలు",
    servicesTitle: "మీకు అవసరమైన ప్రతిదీ ఒకే చోట",
    servicesDescription:
      "సహకార రంగానికి సంబంధించిన సమాచారం, సేవలు మరియు సహాయాన్ని పొందండి.",
    mitraTitle: "మిత్ర చాట్",
    mitraDescription:
      "మీకు ఇష్టమైన భాషలో సమాధానాలు మరియు మార్గదర్శకత్వం పొందండి.",
    mitraAction: "మిత్రతో మాట్లాడండి",
    schemesTitle: "పథకాలు & సబ్సిడీలు",
    schemesDescription:
      "సహకార సంస్థలకు అందుబాటులో ఉన్న ప్రభుత్వ పథకాలను చూడండి.",
    viewAll: "అన్నీ చూడండి",
    viewDetails: "వివరాలు చూడండి",
    legalTitle: "చట్టాలు & ఉపనియమాలు",
    legalDescription:
      "సహకార చట్టాలు, నియమాలు, సెక్షన్లు మరియు నమూనా ఉపనియమాలను చూడండి.",
    legalAction: "చట్టపరమైన వనరులు",
    grievanceTitle: "ఫిర్యాదు నమోదు",
    grievanceDescription:
      "సహకార సమస్యను నివేదించి మీ ఫిర్యాదు స్థితిని తెలుసుకోండి.",
    grievanceAction: "ఫిర్యాదు నమోదు చేయండి",
    announcements: "ప్రకటనలు",
    announcementOne: "సహకార పథకాలు మరియు కార్యక్రమాల సమాచారం",
    announcementTwo: "చట్టాలు మరియు ఉపనియమ వనరులు నవీకరించబడ్డాయి",
    announcementThree: "సభ్యుల ఫిర్యాదు సహాయం అందుబాటులో ఉంది",
    resourceTitle: "సహకార వనరులు",
    resourceDescription:
      "పథకాలు, చట్టాలు మరియు సహకార సేవల ధృవీకరించబడిన సమాచారాన్ని పొందండి.",
    languages: "5 భాషలు",
    guidance: "మిత్ర మార్గదర్శకత్వం",
    cooperativeServices: "సహకార సేవలు",
    memberServices: "సభ్య సేవలు",
    governmentPrograms: "ప్రభుత్వ కార్యక్రమాలు",
    actsBylaws: "చట్టాలు మరియు ఉపనియమాలు",
    multilingualSupport: "బహుభాషా సహాయం",
    people: "ప్రజలు",
    cooperation: "సహకారం",
    progress: "అభివృద్ధి",
    strongerCooperatives: "బలమైన సహకారాలు.",
    brighterCommunities: "మెరుగైన సమాజాలు.",
    cooperativeMembers: "సహకార సభ్యులు",
    verifiedInformation: "ధృవీకరించబడిన సమాచారం",
    multilingual: "బహుభాషా సహాయం",
    newLabel: "కొత్త",
    noticeLabel: "నోటీసు",
    updateLabel: "నవీకరణ",
    noSchemes: "ప్రస్తుతం పథకాలు అందుబాటులో లేవు.",
  },
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const finance = {
    en: ["Financial Literacy", "Learn about loans, savings, insurance and safe digital payments.", "Explore guidance"],
    hi: ["वित्तीय साक्षरता", "ऋण, बचत, बीमा और सुरक्षित डिजिटल भुगतान के बारे में जानें।", "मार्गदर्शन देखें"],
    kn: ["ಹಣಕಾಸು ಸಾಕ್ಷರತೆ", "ಸಾಲ, ಉಳಿತಾಯ, ವಿಮೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಪಾವತಿಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.", "ಮಾರ್ಗದರ್ಶನ ನೋಡಿ"],
    mr: ["आर्थिक साक्षरता", "कर्ज, बचत, विमा आणि सुरक्षित डिजिटल पेमेंटबद्दल जाणून घ्या.", "मार्गदर्शन पहा"],
    te: ["ఆర్థిక అవగాహన", "రుణాలు, పొదుపు, బీమా మరియు సురక్షిత డిజిటల్ చెల్లింపుల గురించి తెలుసుకోండి.", "మార్గదర్శకం చూడండి"],
  }[language];
  const sectionLabels = { en: ["Government Support", "Latest Information", "Cooperative Community"], hi: ["सरकारी सहायता", "नवीनतम जानकारी", "सहकारी समुदाय"], kn: ["ಸರ್ಕಾರಿ ಬೆಂಬಲ", "ಇತ್ತೀಚಿನ ಮಾಹಿತಿ", "ಸಹಕಾರಿ ಸಮುದಾಯ"], mr: ["शासकीय सहाय्य", "नवीनतम माहिती", "सहकारी समुदाय"], te: ["ప్రభుత్వ సహాయం", "తాజా సమాచారం", "సహకార సమాజం"] }[language];

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const data = await api.getSchemes();

        if (Array.isArray(data)) {
          setSchemes(data.slice(0, 3));
        } else {
          setSchemes([]);
        }
      } catch {
        setSchemes([]);
      }
    };

    loadSchemes();
  }, []);

  const getSchemeTitle = (scheme: Scheme) => {
    if (language === "hi" && scheme.title_hi) {
      return scheme.title_hi;
    }

    if (language === "kn" && scheme.title_kn) {
      return scheme.title_kn;
    }

    if (language === "mr" && scheme.title_mr) {
      return scheme.title_mr;
    }

    if (language === "te" && scheme.title_te) {
      return scheme.title_te;
    }

    return scheme.title_en || "Cooperative Scheme";
  };

  const getSchemeDescription = (scheme: Scheme) => {
    if (language === "hi" && scheme.description_hi) {
      return scheme.description_hi;
    }

    if (language === "kn" && scheme.description_kn) {
      return scheme.description_kn;
    }

    if (language === "mr" && scheme.description_mr) {
      return scheme.description_mr;
    }

    if (language === "te" && scheme.description_te) {
      return scheme.description_te;
    }

    return (
      scheme.description_en ||
      "Information and support for cooperative members."
    );
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    window.location.href = `/schemes?search=${encodeURIComponent(query)}`;
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f5f7f4] text-[#14291f]"
    >
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="overflow-hidden bg-[#173b2a] text-white">
        <div className="container-public">
          <div className="grid min-h-[470px] lg:grid-cols-[1.28fr_0.72fr]">

            {/* LEFT CONTENT */}
            <div className="flex flex-col justify-center px-6 py-14 sm:px-8 lg:px-0 lg:py-16">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#dcae2f]">
                <span className="h-px w-10 bg-[#dcae2f]" />

                <span>{t.eyebrow}</span>
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.16] tracking-tight sm:text-5xl lg:text-[56px]">
                <span className="block">{t.heroTitle}</span>

                <span className="mt-1 block text-[#dce9e1]">
                  {t.heroTitle2}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#c8d9cf] sm:text-base">
                {t.heroDescription}
              </p>

              {/* SEARCH */}
              <form
                onSubmit={handleSearch}
                className="mt-8 flex w-full max-w-2xl flex-col sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879b90]" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder={t.searchPlaceholder}
                    className="h-14 w-full border-0 bg-white pl-12 pr-4 text-sm text-[#17231d] outline-none placeholder:text-[#8794a0]"
                  />
                </div>

                <button
                  type="submit"
                  className="flex h-14 items-center justify-center gap-2 bg-[#dcae2f] px-7 text-sm font-bold text-[#173b2a] transition hover:bg-[#ebc44e]"
                >
                  {t.search}

                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* POPULAR SEARCHES */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="mr-1 font-semibold text-[#c3d5cb]">
                  {t.popular}:
                </span>

                {[
                  t.membership,
                  t.schemes,
                  t.elections,
                  t.bylaws,
                  t.grievances,
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSearch(item)}
                    className="border border-white/15 bg-white/5 px-3 py-1.5 text-[#e0e9e4] transition hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* HERO BUTTONS */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/schemes"
                  className="inline-flex items-center gap-2 bg-[#16824c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#126d40]"
                >
                  {t.exploreSchemes}

                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t.getHelp}

                  <MessageSquare className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* =================================================
                RIGHT IMAGE
            ================================================= */}
            <div className="relative hidden min-h-[400px] overflow-hidden lg:block">

              {/* Smaller photograph */}
              <div className="absolute bottom-8 right-10 top-8 w-[68%] overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=900&q=85"
                  alt="Rural community"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[#173b2a]/20" />
              </div>

              {/* Institutional panel */}
              <div className="absolute bottom-8 left-0 w-[43%] bg-[#0e3022]/95 px-5 py-6">
                <div className="h-px w-9 bg-[#dcae2f]" />

                <div className="mt-5 space-y-1.5 text-[11px] font-bold uppercase leading-6 tracking-[0.18em] text-white">
                  <div>{t.people}</div>
                  <div>{t.cooperation}</div>
                  <div>{t.progress}</div>
                </div>

                <p className="mt-5 text-xs leading-5 text-[#c5d8cd]">
                  {t.strongerCooperatives}
                  <br />
                  {t.brighterCommunities}
                </p>

                <div className="mt-5 space-y-3 text-[11px] text-[#d4e2db]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-[#dcae2f]" />

                    <span>{t.cooperativeMembers}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#dcae2f]" />

                    <span>{t.verifiedInformation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 shrink-0 text-[#dcae2f]" />

                    <span>{t.multilingual}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK SERVICES
      ===================================================== */}
      <section className="border-b border-[#dce3de] bg-white">
        <div className="container-public py-10 sm:py-12">
          <div className="mb-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#dcae2f]">
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>{t.servicesEyebrow}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#102b20] sm:text-3xl">
              {t.servicesTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66746b]">
              {t.servicesDescription}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5">

            {/* Mitra */}
            <Link
              href="/chat"
              className="group border-b border-[#e5e9e5] p-6 transition hover:bg-[#f4f8f5] lg:border-b-0 lg:border-r"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f1e9] text-[#16824c]">
                <MessageSquare className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#19352a]">
                {t.mitraTitle}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#738078]">
                {t.mitraDescription}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#16824c]">
                {t.mitraAction}

                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            <Link
              href="/financial-literacy"
              className="group border-b border-[#e5e9e5] p-6 transition hover:bg-[#f4f8f5] lg:border-b-0 lg:border-r"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f1e9] text-[#16824c]">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[#19352a]">{finance[0]}</h3>
              <p className="mt-1 text-xs leading-5 text-[#738078]">{finance[1]}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#16824c]">{finance[2]} <ChevronRight className="h-3.5 w-3.5" /></div>
            </Link>

            {/* Schemes */}
            <Link
              href="/schemes"
              className="group border-b border-[#e5e9e5] p-6 transition hover:bg-[#f4f8f5] lg:border-b-0 lg:border-r"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f1e9] text-[#16824c]">
                <FileText className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#19352a]">
                {t.schemesTitle}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#738078]">
                {t.schemesDescription}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#16824c]">
                {t.viewDetails}

                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Legal */}
            <Link
              href="/legal"
              className="group border-b border-[#e5e9e5] p-6 transition hover:bg-[#f4f8f5] sm:border-b-0 lg:border-r"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f1e9] text-[#16824c]">
                <Scale className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#19352a]">
                {t.legalTitle}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#738078]">
                {t.legalDescription}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#16824c]">
                {t.legalAction}

                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Grievance */}
            <Link
              href="/grievance"
              className="group p-6 transition hover:bg-[#f4f8f5]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f1e9] text-[#16824c]">
                <Megaphone className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#19352a]">
                {t.grievanceTitle}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#738078]">
                {t.grievanceDescription}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#16824c]">
                {t.grievanceAction}

                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED SCHEMES
      ===================================================== */}
      <section className="bg-[#f5f7f4]">
        <div className="container-public py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_330px]">

            {/* SCHEME DIRECTORY */}
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#dcae2f]">
                    <Landmark className="h-4 w-4 shrink-0" />
                    <span>{sectionLabels[0]}</span>
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-[#102b20] sm:text-3xl">
                    {t.schemesTitle}
                  </h2>
                </div>

                <Link
                  href="/schemes"
                  className="hidden items-center gap-1 text-xs font-bold text-[#16824c] hover:underline sm:flex"
                >
                  {t.viewAll}

                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66746b]">
                {t.schemesDescription}
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {schemes.length > 0 ? (
                  schemes.map((scheme, index) => (
                    <Link
                      href="/schemes"
                      key={scheme.id}
                      className="group border border-[#dce3de] bg-white transition hover:-translate-y-0.5 hover:border-[#b8cbbd] hover:shadow-sm"
                    >
                      <div className="relative h-28 overflow-hidden bg-[#e9f0eb]">
                        <img
                          src={
                            index === 0
                              ? "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=700&q=80"
                              : index === 1
                                ? "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=700&q=80"
                                : "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80"
                          }
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#173b2a]/60 to-transparent" />

                        <span className="absolute left-3 top-3 bg-[#16824c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          {scheme.category || "Scheme"}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="font-mono text-[9px] uppercase tracking-wider text-[#8a968f]">
                          {scheme.scheme_code || "COOPERATIVE"}
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#172d23]">
                          {getSchemeTitle(scheme)}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#718078]">
                          {getSchemeDescription(scheme)}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16824c]">
                          {t.viewDetails}

                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="border border-[#dce3de] bg-white p-8 text-sm text-[#68756d] md:col-span-3">
                    {t.noSchemes}
                  </div>
                )}
              </div>

              <Link
                href="/schemes"
                className="mt-5 flex items-center justify-center gap-2 border border-[#bfcfc4] bg-white px-5 py-3 text-xs font-bold text-[#16824c] sm:hidden"
              >
                {t.viewAll}

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ANNOUNCEMENTS */}
            <aside className="border border-[#dce3de] bg-white">
              <div className="border-b border-[#e5e9e5] px-5 py-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#dcae2f]">
                  <Megaphone className="h-4 w-4 shrink-0" />
                  <span>{sectionLabels[1]}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#1a3327] sm:text-2xl">
                  {t.announcements}
                </h2>
              </div>

              <div className="divide-y divide-[#edf0ed]">

                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 bg-[#dff0e6] px-2 py-1 text-[9px] font-bold uppercase text-[#16824c]">
                      {t.newLabel}
                    </span>

                    <p className="text-xs font-semibold leading-5 text-[#394b42]">
                      {t.announcementOne}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 bg-[#fff1cc] px-2 py-1 text-[9px] font-bold uppercase text-[#8b6b16]">
                      {t.noticeLabel}
                    </span>

                    <p className="text-xs font-semibold leading-5 text-[#394b42]">
                      {t.announcementTwo}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 bg-[#e3edf8] px-2 py-1 text-[9px] font-bold uppercase text-[#3c658b]">
                      {t.updateLabel}
                    </span>

                    <p className="text-xs font-semibold leading-5 text-[#394b42]">
                      {t.announcementThree}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e5e9e5] px-5 py-4">
                <Link
                  href="/schemes"
                  className="flex items-center justify-between text-xs font-bold text-[#16824c]"
                >
                  {t.viewAll}

                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICE INFORMATION
      ===================================================== */}
      <section className="border-y border-[#dbe4de] bg-white">
        <div className="container-public py-10 sm:py-12">
          <div className="mb-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#dcae2f]">
              <Users className="h-4 w-4 shrink-0" />
              <span>{sectionLabels[2]}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#102b20] sm:text-3xl">
              {t.cooperativeServices}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66746b]">
              {t.resourceDescription}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">

            <div className="flex items-center gap-4 border-b border-[#e4e9e5] px-6 py-6 lg:border-b-0 lg:border-r">
              <Users className="h-7 w-7 shrink-0 text-[#16824c]" />

              <div>
                <div className="text-sm font-bold text-[#18352a]">
                  {t.cooperativeServices}
                </div>

                <div className="mt-1 text-xs text-[#7b877f]">
                  {t.memberServices}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-[#e4e9e5] px-6 py-6 lg:border-b-0 lg:border-r">
              <FileText className="h-7 w-7 shrink-0 text-[#16824c]" />

              <div>
                <div className="text-sm font-bold text-[#18352a]">
                  {t.schemes}
                </div>

                <div className="mt-1 text-xs text-[#7b877f]">
                  {t.governmentPrograms}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-[#e4e9e5] px-6 py-6 sm:border-b-0 lg:border-r">
              <Scale className="h-7 w-7 shrink-0 text-[#16824c]" />

              <div>
                <div className="text-sm font-bold text-[#18352a]">
                  {t.legalTitle}
                </div>

                <div className="mt-1 text-xs text-[#7b877f]">
                  {t.actsBylaws}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-6">
              <MessageSquare className="h-7 w-7 shrink-0 text-[#16824c]" />

              <div>
                <div className="text-sm font-bold text-[#18352a]">
                  {t.languages}
                </div>

                <div className="mt-1 text-xs text-[#7b877f]">
                  {t.multilingualSupport}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESOURCE CTA
      ===================================================== */}
      <section className="bg-[#173b2a]">
        <div className="container-public">
          <div className="flex flex-col justify-between gap-6 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:px-0">

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dcae2f]">
                {t.resourceTitle}
              </div>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t.resourceTitle}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c5d7cc]">
                {t.resourceDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/legal"
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                {t.legalTitle}

                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/grievance"
                className="inline-flex items-center gap-2 bg-[#dcae2f] px-5 py-3 text-xs font-bold text-[#173b2a] transition hover:bg-[#edc24d]"
              >
                {t.grievanceAction}

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING MITRA */}
      <MitraChatWidget />
    </main>
  );
}
