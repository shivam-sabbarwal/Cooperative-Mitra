"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  FileText,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { api } from "@/lib/api";

interface LegalSection {
  id: number;
  section_number: string;
  chapter?: string | null;

  title_en: string;
  title_hi: string;
  title_kn: string;
  title_mr?: string;
  title_te?: string;

  simplified_en: string;
  simplified_hi: string;
  simplified_kn: string;
  simplified_mr?: string;
  simplified_te?: string;

  official_text: string;
  source_citation: string;
}

interface LegalAct {
  id: number;
  act_code: string;

  title_en: string;
  title_hi: string;
  title_kn: string;
  title_mr?: string;
  title_te?: string;

  jurisdiction: string;
  enacted_year?: number | null;
  description: string;
  source_type: string;
  official_source_url?: string | null;
  sections: LegalSection[];
}

interface SearchResult {
  act_code: string;
  act_title: string;
  section_number: string;
  section_title: string;
  simplified_text: string;
  official_text: string;
  citation: string;
}

const translations: Record<
  Language,
  {
    title: string;
    subtitle: string;
    registry: string;
    availableActs: string;
    acts: string;
    sections: string;
    searchPlaceholder: string;
    search: string;
    clear: string;
    allActs: string;
    directory: string;
    legalRecords: string;
    officialSource: string;
    official: string;
    reference: string;
    jurisdiction: string;
    enacted: string;
    overview: string;
    plainLanguage: string;
    officialText: string;
    citation: string;
    hide: string;
    view: string;
    legalNotice: string;
    legalNoticeText: string;
    noResults: string;
    retry: string;
    askMitra: string;
    helpTitle: string;
    helpText: string;
    openAssistant: string;
    backToRegistry: string;
    searchResults: string;
    matches: string;
    noActs: string;
  }
> = {
  en: {
    title: "Legal & Bye-Laws Registry",
    subtitle:
      "Explore cooperative acts, statutory sections and model bye-laws in one structured reference.",
    registry: "COOPERATIVE LAW",
    availableActs: "AVAILABLE ACTS",
    acts: "Acts",
    sections: "Sections",
    searchPlaceholder:
      "Search sections, membership, voting, elections, disputes...",
    search: "Search",
    clear: "Clear",
    allActs: "All",
    directory: "DIRECTORY",
    legalRecords: "Available Legal Records",
    officialSource: "Official source",
    official: "Official",
    reference: "Reference",
    jurisdiction: "Jurisdiction",
    enacted: "Enacted",
    overview: "ACT OVERVIEW",
    plainLanguage: "Plain Language",
    officialText: "Official Text",
    citation: "Citation",
    hide: "Hide",
    view: "View",
    legalNotice: "LEGAL NOTICE",
    legalNoticeText:
      "This information is provided for general informational guidance and is not a substitute for professional legal advice.",
    noResults: "No legal sections found for this search.",
    retry: "Retry",
    askMitra: "Ask Mitra",
    helpTitle: "Need help understanding a cooperative rule?",
    helpText:
      "Ask Mitra for a plain-language explanation based on the available legal sources.",
    openAssistant: "Open Legal Assistant",
    backToRegistry: "Back to registry",
    searchResults: "Search Results",
    matches: "matches",
    noActs: "No legal records are currently available.",
  },

  hi: {
    title: "कानूनी एवं उप-नियम रजिस्ट्री",
    subtitle:
      "सहकारी अधिनियमों, वैधानिक धाराओं और मॉडल उप-नियमों को एक संरचित संदर्भ में देखें।",
    registry: "सहकारी कानून",
    availableActs: "उपलब्ध अधिनियम",
    acts: "अधिनियम",
    sections: "धाराएं",
    searchPlaceholder:
      "सदस्यता, मतदान, चुनाव, विवाद या धारा खोजें...",
    search: "खोजें",
    clear: "साफ़ करें",
    allActs: "सभी",
    directory: "डायरेक्टरी",
    legalRecords: "उपलब्ध कानूनी रिकॉर्ड",
    officialSource: "आधिकारिक स्रोत",
    official: "आधिकारिक",
    reference: "संदर्भ",
    jurisdiction: "क्षेत्राधिकार",
    enacted: "अधिनियमित",
    overview: "अधिनियम का विवरण",
    plainLanguage: "सरल भाषा",
    officialText: "आधिकारिक पाठ",
    citation: "संदर्भ",
    hide: "छिपाएं",
    view: "देखें",
    legalNotice: "कानूनी सूचना",
    legalNoticeText:
      "यह जानकारी सामान्य सूचनात्मक मार्गदर्शन के लिए है और पेशेवर कानूनी सलाह का विकल्प नहीं है।",
    noResults: "इस खोज के लिए कोई कानूनी धारा नहीं मिली।",
    retry: "पुनः प्रयास",
    askMitra: "मित्र से पूछें",
    helpTitle: "सहकारी नियम समझने में सहायता चाहिए?",
    helpText:
      "उपलब्ध कानूनी स्रोतों के आधार पर सरल भाषा में स्पष्टीकरण के लिए मित्र से पूछें।",
    openAssistant: "कानूनी सहायक खोलें",
    backToRegistry: "रजिस्ट्री पर वापस जाएं",
    searchResults: "खोज परिणाम",
    matches: "परिणाम",
    noActs: "वर्तमान में कोई कानूनी रिकॉर्ड उपलब्ध नहीं है।",
  },

  kn: {
    title: "ಕಾನೂನು ಮತ್ತು ಉಪನಿಯಮಗಳ ನೋಂದಣಿ",
    subtitle:
      "ಸಹಕಾರಿ ಕಾಯ್ದೆಗಳು, ಕಾನೂನು ವಿಧಿಗಳು ಮತ್ತು ಮಾದರಿ ಉಪನಿಯಮಗಳನ್ನು ಒಂದೇ ರಚನಾತ್ಮಕ ಉಲ್ಲೇಖದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.",
    registry: "ಸಹಕಾರಿ ಕಾನೂನು",
    availableActs: "ಲಭ್ಯವಿರುವ ಕಾಯ್ದೆಗಳು",
    acts: "ಕಾಯ್ದೆಗಳು",
    sections: "ವಿಧಿಗಳು",
    searchPlaceholder:
      "ಸದಸ್ಯತ್ವ, ಮತದಾನ, ಚುನಾವಣೆ, ವಿವಾದ ಅಥವಾ ವಿಧಿ ಹುಡುಕಿ...",
    search: "ಹುಡುಕಿ",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    allActs: "ಎಲ್ಲಾ",
    directory: "ನೋಂದಣಿ",
    legalRecords: "ಲಭ್ಯವಿರುವ ಕಾನೂನು ದಾಖಲೆಗಳು",
    officialSource: "ಅಧಿಕೃತ ಮೂಲ",
    official: "ಅಧಿಕೃತ",
    reference: "ಉಲ್ಲೇಖ",
    jurisdiction: "ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ",
    enacted: "ಜಾರಿಯಾದ ವರ್ಷ",
    overview: "ಕಾಯ್ದೆಯ ವಿವರ",
    plainLanguage: "ಸರಳ ಭಾಷೆ",
    officialText: "ಅಧಿಕೃತ ಪಠ್ಯ",
    citation: "ಉಲ್ಲೇಖ",
    hide: "ಮರೆಮಾಡಿ",
    view: "ವೀಕ್ಷಿಸಿ",
    legalNotice: "ಕಾನೂನು ಸೂಚನೆ",
    legalNoticeText:
      "ಈ ಮಾಹಿತಿಯು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ ಮತ್ತು ವೃತ್ತಿಪರ ಕಾನೂನು ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
    noResults: "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಕಾನೂನು ವಿಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    retry: "ಮರುಪ್ರಯತ್ನಿಸಿ",
    askMitra: "ಮಿತ್ರರನ್ನು ಕೇಳಿ",
    helpTitle: "ಸಹಕಾರಿ ನಿಯಮವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಬೇಕೇ?",
    helpText:
      "ಲಭ್ಯವಿರುವ ಕಾನೂನು ಮೂಲಗಳ ಆಧಾರದ ಮೇಲೆ ಸರಳ ವಿವರಣೆಗಾಗಿ ಮಿತ್ರರನ್ನು ಕೇಳಿ.",
    openAssistant: "ಕಾನೂನು ಸಹಾಯಕ ತೆರೆಯಿರಿ",
    backToRegistry: "ನೋಂದಣಿಗೆ ಹಿಂತಿರುಗಿ",
    searchResults: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
    matches: "ಫಲಿತಾಂಶಗಳು",
    noActs: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಕಾನೂನು ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",
  },

  mr: {
    title: "कायदे आणि उपनियम नोंदणी",
    subtitle:
      "सहकारी कायदे, वैधानिक कलमे आणि नमुना उपनियम एका संरचित संदर्भात पहा.",
    registry: "सहकारी कायदा",
    availableActs: "उपलब्ध कायदे",
    acts: "कायदे",
    sections: "कलमे",
    searchPlaceholder:
      "सदस्यत्व, मतदान, निवडणूक, वाद किंवा कलम शोधा...",
    search: "शोधा",
    clear: "साफ करा",
    allActs: "सर्व",
    directory: "नोंदणी",
    legalRecords: "उपलब्ध कायदेशीर नोंदी",
    officialSource: "अधिकृत स्रोत",
    official: "अधिकृत",
    reference: "संदर्भ",
    jurisdiction: "अधिकारक्षेत्र",
    enacted: "अधिनियमित",
    overview: "कायद्याचा आढावा",
    plainLanguage: "सोप्या भाषेत",
    officialText: "अधिकृत मजकूर",
    citation: "संदर्भ",
    hide: "लपवा",
    view: "पहा",
    legalNotice: "कायदेशीर सूचना",
    legalNoticeText:
      "ही माहिती सामान्य मार्गदर्शनासाठी आहे आणि व्यावसायिक कायदेशीर सल्ल्याचा पर्याय नाही.",
    noResults: "या शोधासाठी कोणतेही कायदेशीर कलम सापडले नाही.",
    retry: "पुन्हा प्रयत्न करा",
    askMitra: "मित्राला विचारा",
    helpTitle: "सहकारी नियम समजून घेण्यासाठी मदत हवी आहे?",
    helpText:
      "उपलब्ध कायदेशीर स्रोतांवर आधारित सोप्या भाषेतील स्पष्टीकरणासाठी मित्राला विचारा.",
    openAssistant: "कायदेशीर सहाय्यक उघडा",
    backToRegistry: "नोंदणीवर परत जा",
    searchResults: "शोध परिणाम",
    matches: "परिणाम",
    noActs: "सध्या कोणत्याही कायदेशीर नोंदी उपलब्ध नाहीत.",
  },

  te: {
    title: "చట్టాలు & ఉపనియమాల రిజిస్ట్రీ",
    subtitle:
      "సహకార చట్టాలు, చట్టపరమైన సెక్షన్లు మరియు నమూనా ఉపనియమాలను ఒకే నిర్మిత సూచనలో చూడండి.",
    registry: "సహకార చట్టం",
    availableActs: "అందుబాటులో ఉన్న చట్టాలు",
    acts: "చట్టాలు",
    sections: "సెక్షన్లు",
    searchPlaceholder:
      "సభ్యత్వం, ఓటింగ్, ఎన్నికలు, వివాదాలు లేదా సెక్షన్ వెతకండి...",
    search: "వెతకండి",
    clear: "తొలగించండి",
    allActs: "అన్నీ",
    directory: "రిజిస్ట్రీ",
    legalRecords: "అందుబాటులో ఉన్న చట్టపరమైన రికార్డులు",
    officialSource: "అధికారిక మూలం",
    official: "అధికారిక",
    reference: "సూచన",
    jurisdiction: "అధికార పరిధి",
    enacted: "అమలైన సంవత్సరం",
    overview: "చట్టం అవలోకనం",
    plainLanguage: "సరళమైన భాష",
    officialText: "అధికారిక పాఠ్యం",
    citation: "మూల సూచన",
    hide: "దాచు",
    view: "చూడండి",
    legalNotice: "చట్టపరమైన గమనిక",
    legalNoticeText:
      "ఈ సమాచారం సాధారణ సమాచార మార్గదర్శకత్వం కోసం మాత్రమే మరియు వృత్తిపరమైన న్యాయ సలహాకు ప్రత్యామ్నాయం కాదు.",
    noResults: "ఈ శోధనకు చట్టపరమైన సెక్షన్లు కనుగొనబడలేదు.",
    retry: "మళ్లీ ప్రయత్నించండి",
    askMitra: "మిత్రను అడగండి",
    helpTitle: "సహకార నియమాన్ని అర్థం చేసుకోవడానికి సహాయం కావాలా?",
    helpText:
      "అందుబాటులో ఉన్న చట్టపరమైన మూలాల ఆధారంగా సరళమైన వివరణ కోసం మిత్రను అడగండి.",
    openAssistant: "చట్టపరమైన సహాయకుడిని తెరవండి",
    backToRegistry: "రిజిస్ట్రీకి తిరిగి వెళ్లండి",
    searchResults: "శోధన ఫలితాలు",
    matches: "ఫలితాలు",
    noActs: "ప్రస్తుతం చట్టపరమైన రికార్డులు అందుబాటులో లేవు.",
  },
};

export default function LegalPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [acts, setActs] = useState<LegalAct[]>([]);
  const [selectedActId, setSelectedActId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] =
    useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);


  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  const fetchActs = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.getLegalActs();

      setActs(data || []);

      if (data?.length && selectedActId === null) {
        setSelectedActId(data[0].id);
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Unable to fetch legal records. Please check the backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActs();
  }, []);

  const selectedAct = useMemo(() => {
    return (
      acts.find((act) => act.id === selectedActId) ||
      acts[0] ||
      null
    );
  }, [acts, selectedActId]);

  const totalSections = useMemo(() => {
    return acts.reduce(
      (total, act) => total + (act.sections?.length || 0),
      0
    );
  }, [acts]);

  const getActTitle = (act: LegalAct) => {
    if (language === "hi" && act.title_hi) return act.title_hi;
    if (language === "kn" && act.title_kn) return act.title_kn;
    if (language === "mr" && act.title_mr) return act.title_mr;
    if (language === "te" && act.title_te) return act.title_te;

    return act.title_en;
  };

  const getSectionTitle = (section: LegalSection) => {
    if (language === "hi" && section.title_hi)
      return section.title_hi;

    if (language === "kn" && section.title_kn)
      return section.title_kn;

    if (language === "mr" && section.title_mr)
      return section.title_mr;

    if (language === "te" && section.title_te)
      return section.title_te;

    return section.title_en;
  };

  const getSimplifiedText = (section: LegalSection) => {
    if (language === "hi" && section.simplified_hi)
      return section.simplified_hi;

    if (language === "kn" && section.simplified_kn)
      return section.simplified_kn;

    if (language === "mr" && section.simplified_mr)
      return section.simplified_mr;

    if (language === "te" && section.simplified_te)
      return section.simplified_te;

    return section.simplified_en;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (query.length < 2) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await api.searchLegal(query, language);
      setSearchResults(results || []);
    } catch (err: any) {
      setSearchError(
        err?.message || "Failed to search legal sections."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
  };

  const toggleSection = (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#16271f]">
      {/* =========================================================
          HERO — SAME STRUCTURE AS SCHEMES
      ========================================================= */}
      <section className="bg-[#173b2a] text-white">
        <div className="container-public">
          <div className="grid lg:grid-cols-[1fr_220px]">
            <div className="px-6 py-10 sm:px-8 lg:px-0 lg:py-11">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#dcae2f]">
                <Scale className="h-4 w-4 text-[#dcae2f]" />
                <span>{t.registry}</span>
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {t.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c9d9d0] sm:text-base">
                {t.subtitle}
              </p>

              {/* Search inside hero */}
              <form
                onSubmit={handleSearch}
                className="mt-8 flex flex-col gap-3 lg:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a2b5]" />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder={t.searchPlaceholder}
                    className="h-16 w-full border border-white/10 bg-white px-12 text-sm text-[#17231d] outline-none placeholder:text-[#8a99ab] focus:border-[#c9a54c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isSearching ||
                    searchQuery.trim().length < 2
                  }
                  className="flex h-16 min-w-[150px] items-center justify-center gap-2 bg-[#dcae2f] px-6 text-sm font-bold text-[#173b2a] transition-colors hover:bg-[#edc24d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}

                  {t.search}
                </button>
              </form>
            </div>

            {/* Counter */}
            <div className="border-t border-white/10 lg:border-l lg:border-t-0">
              <div className="flex h-full min-h-[210px] flex-col justify-center px-7 py-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#72c89b]">
                  {t.availableActs}
                </div>

                <div className="mt-3 text-5xl font-semibold tracking-tight">
                  {acts.length.toString().padStart(2, "0")}
                </div>

                <div className="mt-1 text-xs uppercase tracking-wider text-[#9bb2a6]">
                  {t.acts}
                </div>

                <div className="mt-7 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-2 text-xs text-[#c1d0c8]">
                    <Scale className="h-4 w-4 text-[#dcae2f]" />
                    <span>
                      {totalSections} {t.sections.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTER BAR — SAME FEEL AS SCHEMES
      ========================================================= */}
      <section className="border-b border-[#dfe4df] bg-white">
        <div className="container-public">
          <div className="flex min-h-[80px] flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#819087]">
                <Filter className="h-4 w-4" />
                {t.acts}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (acts.length > 0) {
                    setSelectedActId(acts[0].id);
                  }
                  clearSearch();
                }}
                className={`border px-5 py-2.5 text-xs font-semibold transition-colors ${
                  !searchResults && selectedActId === acts[0]?.id
                    ? "border-[#173b2a] bg-[#173b2a] text-white"
                    : "border-[#d9e0db] bg-white text-[#34473d] hover:bg-[#f5f7f5]"
                }`}
              >
                {t.allActs}
              </button>

              {acts.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    setSelectedActId(act.id);
                    clearSearch();
                  }}
                  className={`border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    selectedActId === act.id && !searchResults
                      ? "border-[#173b2a] bg-[#173b2a] text-white"
                      : "border-[#d9e0db] bg-white text-[#34473d] hover:bg-[#f5f7f5]"
                  }`}
                >
                  {act.act_code}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64756b]">
              <ShieldCheck className="h-4 w-4 text-[#16824c]" />
              <span>
                {acts.length} {t.acts.toLowerCase()} ·{" "}
                {totalSections} {t.sections.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <div className="container-public py-10">
        {/* Search error */}
        {searchError && (
          <div className="mb-6 flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Backend error */}
        {errorMsg && (
          <div className="mb-6 flex flex-col justify-between gap-3 border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>{errorMsg}</span>
            </div>

            <button
              type="button"
              onClick={fetchActs}
              className="flex items-center gap-2 border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t.retry}
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-36 animate-pulse border border-[#dce2dd] bg-white" />
            <div className="h-28 animate-pulse border border-[#dce2dd] bg-white" />
            <div className="h-28 animate-pulse border border-[#dce2dd] bg-white" />
          </div>
        )}

        {/* =======================================================
            SEARCH RESULTS
        ======================================================= */}
        {!isLoading && searchResults !== null && (
          <section>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16824c]">
                  {t.registry}
                </div>

                <h2 className="mt-2 text-2xl font-semibold text-[#102b20]">
                  {t.searchResults}
                </h2>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="text-xs font-semibold text-[#16824c] hover:underline"
              >
                {t.backToRegistry}
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="border border-[#dce2dd] bg-white px-6 py-16 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-[#9aa69f]" />

                <h3 className="mt-4 text-base font-semibold text-[#263a30]">
                  {t.noResults}
                </h3>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <article
                    key={`${result.act_code}-${result.section_number}-${index}`}
                    className="border border-[#dce2dd] bg-white"
                  >
                    <div className="grid md:grid-cols-[90px_1fr_190px]">
                      <div className="flex items-start justify-center border-b border-[#e5e9e5] bg-[#f3f6f3] px-4 py-6 md:border-b-0 md:border-r">
                        <div className="text-center">
                          <div className="text-xs text-[#a0aaa4]">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="mt-2 font-mono text-sm font-semibold text-[#16824c]">
                            {result.section_number}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#16824c]">
                          {result.act_code}
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-[#172d23]">
                          {result.section_title}
                        </h3>

                        <div className="mt-4 border-l-2 border-[#dcae2f] bg-[#faf8f0] px-4 py-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#866c21]">
                            {t.plainLanguage}
                          </div>

                          <p className="mt-1 text-sm leading-6 text-[#4d5d54]">
                            {result.simplified_text}
                          </p>
                        </div>

                        <details className="mt-4">
                          <summary className="cursor-pointer text-xs font-semibold text-[#16824c]">
                            {t.officialText}
                          </summary>

                          <div className="mt-3 border border-[#dfe3df] bg-[#f5f6f4] p-4 font-mono text-xs leading-6 text-[#4d5952]">
                            {result.official_text}
                          </div>
                        </details>

                        <div className="mt-4 flex gap-2 border-t border-[#edf0ed] pt-3 text-[11px] text-[#7a867f]">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#16824c]" />
                          <span>
                            {t.citation}: {result.citation}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-[#e5e9e5] bg-[#fafbfa] p-5 md:border-l md:border-t-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#89968f]">
                          {t.reference}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#16824c]">
                          <ShieldCheck className="h-4 w-4" />
                          {t.official}
                        </div>

                        <div className="mt-5 text-[10px] leading-5 text-[#7d8982]">
                          {result.act_title}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =======================================================
            LEGAL DIRECTORY
        ======================================================= */}
        {!isLoading &&
          searchResults === null &&
          selectedAct && (
            <>
              {/* Legal notice */}
              <div className="mb-9 border border-[#eadfbf] bg-[#fffaf0] px-5 py-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#ad8219]" />

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#87691d]">
                      {t.legalNotice}
                    </div>

                    <p className="mt-1 text-xs leading-6 text-[#67582d] sm:text-sm">
                      {t.legalNoticeText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directory title */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16824c]">
                    {t.directory}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-[#102b20] sm:text-3xl">
                    {t.legalRecords}
                  </h2>
                </div>

                <div className="text-xs uppercase tracking-wider text-[#829087]">
                  {acts.length.toString().padStart(2, "0")} {t.acts}
                </div>
              </div>

              {/* =================================================
                  ACT REGISTRY ROW
              ================================================= */}
              <div className="space-y-3">
                {acts.map((act, index) => {
                  const active = act.id === selectedAct.id;

                  return (
                    <article
                      key={act.id}
                      className={`border bg-white transition-all ${
                        active
                          ? "border-[#b9c9be]"
                          : "border-[#dce2dd]"
                      }`}
                    >
                      <div className="grid lg:grid-cols-[88px_1fr_210px]">
                        {/* Number */}
                        <div
                          className={`flex items-start justify-center border-b px-4 py-7 lg:border-b-0 lg:border-r ${
                            active
                              ? "border-[#d4e0d8] bg-[#f0f6f2]"
                              : "border-[#e5e9e5] bg-[#f7f8f7]"
                          }`}
                        >
                          <div className="font-mono text-sm font-semibold text-[#16824c]">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>

                        {/* Main record */}
                        <div className="p-6 sm:p-7">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16824c]">
                              {act.jurisdiction}
                            </span>

                            <span className="text-[#aab2ad]">/</span>

                            <span className="font-mono text-[10px] font-medium text-[#7b8981]">
                              {act.act_code}
                            </span>
                          </div>

                          <h3 className="mt-3 max-w-4xl text-xl font-semibold leading-7 text-[#172d23] sm:text-2xl">
                            {getActTitle(act)}
                          </h3>

                          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#647169]">
                            {act.description}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#7c8981]">
                            <span>
                              {act.sections?.length || 0}{" "}
                              {t.sections.toLowerCase()}
                            </span>

                            {act.enacted_year && (
                              <span>
                                {t.enacted}: {act.enacted_year}
                              </span>
                            )}

                            <span>
                              {t.jurisdiction}:{" "}
                              {act.jurisdiction}
                            </span>
                          </div>
                        </div>

                        {/* Source */}
                        <div className="border-t border-[#e5e9e5] bg-[#fafbfa] p-6 lg:border-l lg:border-t-0">
                          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a958f]">
                            {t.reference}
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#16824c]">
                            <ShieldCheck className="h-4 w-4" />

                            {act.source_type === "OFFICIAL"
                              ? t.official
                              : t.reference}
                          </div>

                          {act.official_source_url && (
                            <a
                              href={act.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#20553b] hover:underline"
                            >
                              {t.officialSource}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedActId(act.id)
                            }
                            className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#16824c] hover:text-[#0e6439]"
                          >
                            {t.sections}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Act expanded content */}
                      {active && (
                        <div className="border-t border-[#dce2dd]">
                          {/* Overview metadata */}
                          <div className="grid border-b border-[#e5e9e5] bg-[#f7f8f6] sm:grid-cols-3">
                            <div className="border-b border-[#e5e9e5] px-5 py-4 sm:border-b-0 sm:border-r">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a958f]">
                                {t.overview}
                              </div>

                              <div className="mt-1 text-sm font-semibold text-[#31463b]">
                                {act.act_code}
                              </div>
                            </div>

                            <div className="border-b border-[#e5e9e5] px-5 py-4 sm:border-b-0 sm:border-r">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a958f]">
                                {t.sections}
                              </div>

                              <div className="mt-1 text-sm font-semibold text-[#31463b]">
                                {act.sections?.length || 0}
                              </div>
                            </div>

                            <div className="px-5 py-4">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a958f]">
                                {t.enacted}
                              </div>

                              <div className="mt-1 text-sm font-semibold text-[#31463b]">
                                {act.enacted_year || "—"}
                              </div>
                            </div>
                          </div>

                          {/* Sections */}
                          <div className="p-5 sm:p-7">
                            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#16824c]">
                                  {t.sections}
                                </div>

                                <h4 className="mt-1 text-lg font-semibold text-[#20372b]">
                                  {getActTitle(act)}
                                </h4>
                              </div>

                              <div className="text-xs text-[#87928b]">
                                {act.sections?.length || 0}{" "}
                                {t.sections.toLowerCase()}
                              </div>
                            </div>

                            <div className="space-y-2">
                              {act.sections?.map(
                                (section, sectionIndex) => {
                                  const expanded =
                                    expandedSections[
                                      section.id
                                    ] ?? true;

                                  return (
                                    <div
                                      key={section.id}
                                      className="border border-[#dfe4df] bg-white"
                                    >
                                      {/* Section header */}
                                      <div className="grid md:grid-cols-[72px_1fr_auto]">
                                        <div className="flex items-center justify-center border-b border-[#e7ebe7] bg-[#f4f7f4] px-3 py-4 md:border-b-0 md:border-r">
                                          <div className="text-center">
                                            <div className="text-[9px] uppercase tracking-wider text-[#96a19a]">
                                              No.
                                            </div>

                                            <div className="mt-1 font-mono text-xs font-semibold text-[#16824c]">
                                              {section.section_number ||
                                                String(
                                                  sectionIndex + 1
                                                ).padStart(2, "0")}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="px-5 py-4">
                                          {section.chapter && (
                                            <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[#8b968f]">
                                              {section.chapter}
                                            </div>
                                          )}

                                          <div className="text-sm font-semibold leading-6 text-[#263b31]">
                                            {getSectionTitle(
                                              section
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center border-t border-[#e7ebe7] px-4 py-3 md:border-l md:border-t-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              toggleSection(
                                                section.id
                                              )
                                            }
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#627067] hover:text-[#16824c]"
                                          >
                                            {expanded
                                              ? t.hide
                                              : t.view}

                                            {expanded ? (
                                              <ChevronUp className="h-4 w-4" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Section body */}
                                      {expanded && (
                                        <div className="border-t border-[#e5e9e5]">
                                          <div className="border-b border-[#edf0ed] bg-[#fafbfa] px-5 py-3">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#89958e]">
                                              {t.overview}
                                            </div>
                                          </div>

                                          <div className="p-5">
                                            <div className="border-l-2 border-[#dcae2f] bg-[#faf8f0] px-4 py-4 sm:px-5">
                                              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#866c21]">
                                                {t.plainLanguage}
                                              </div>

                                              <p className="text-sm leading-7 text-[#4d5d54]">
                                                {getSimplifiedText(section)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex flex-col gap-3 border-t border-[#edf0ed] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-2 text-[10px] leading-5 text-[#7e8a83]">
                                              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16824c]" />
                                              <span>
                                                {
                                                  t.citation
                                                }
                                                :{" "}
                                                {
                                                  section.source_citation
                                                }
                                              </span>
                                            </div>

                                            <Link
                                              href="/chat"
                                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16824c] hover:underline"
                                            >
                                              {t.askMitra}
                                              <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

        {/* No data */}
        {!isLoading &&
          !errorMsg &&
          searchResults === null &&
          !selectedAct && (
            <div className="border border-[#dce2dd] bg-white px-6 py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-[#98a39c]" />

              <h2 className="mt-4 text-lg font-semibold text-[#263a30]">
                {t.noActs}
              </h2>
            </div>
          )}

        {/* =======================================================
            MITRA FOOTER — SUBTLE LIKE SCHEMES
        ======================================================= */}
        <section className="mt-12 border border-[#294d3b] bg-[#173b2a]">
          <div className="flex flex-col items-start justify-between gap-5 px-6 py-7 sm:flex-row sm:items-center sm:px-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#dcae2f]">
                COOPERATIVE MITRA
              </div>

              <h2 className="mt-2 text-lg font-semibold text-white">
                {t.helpTitle}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#c3d2ca]">
                {t.helpText}
              </p>
            </div>

            <Link
              href="/chat"
              className="inline-flex shrink-0 items-center gap-2 bg-[#dcae2f] px-5 py-3 text-xs font-bold text-[#173b2a] transition-colors hover:bg-[#edc24d]"
            >
              {t.openAssistant}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
