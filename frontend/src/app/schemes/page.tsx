"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  FileText,
  Landmark,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Filter,
  RefreshCw,
  FileCheck,
  ArrowRight,
} from "lucide-react";

const eligibilityText = {
  en: { service: "Eligibility service", title: "Check your eligibility", intro: "Enter a few details to compare your profile against the eligibility criteria available for the selected scheme.", note: "Results are provided for guidance and should be verified against the relevant scheme authority before application.", scheme: "Scheme", applicant: "Applicant type", land: "Land holding", membership: "PACS / cooperative membership", farmer: "Individual Farmer", pacs: "PACS / Cooperative Society", fpo: "Farmer Producer Organization", shg: "Women Self-Help Group", artisan: "Rural Artisan / Micro-Cooperative", landPlaceholder: "e.g. 5.0 acres", yes: "Yes", no: "No", checking: "Evaluating...", check: "Check eligibility", matched: "Eligibility criteria matched", unmet: "Some criteria are not met", matchedCriteria: "Matched criteria", missingCriteria: "Missing criteria", noMatched: "No criteria matched.", allMet: "All available criteria are satisfied.", guidance: "Guidance", documents: "Required documents", help: "Need help understanding a scheme?", helpText: "Get assistance and information in your preferred language.", ask: "Ask Mitra" },
  hi: { service: "पात्रता सेवा", title: "अपनी पात्रता जांचें", intro: "चुनी गई योजना के उपलब्ध पात्रता मानदंड से अपनी जानकारी की तुलना करने के लिए कुछ विवरण भरें।", note: "परिणाम केवल मार्गदर्शन के लिए हैं; आवेदन से पहले संबंधित योजना प्राधिकरण से सत्यापित करें।", scheme: "योजना", applicant: "आवेदक का प्रकार", land: "भूमि धारिता", membership: "पैक्स / सहकारी सदस्यता", farmer: "व्यक्तिगत किसान", pacs: "पैक्स / सहकारी समिति", fpo: "किसान उत्पादक संगठन", shg: "महिला स्वयं सहायता समूह", artisan: "ग्रामीण कारीगर / सूक्ष्म सहकारी", landPlaceholder: "जैसे 5.0 एकड़", yes: "हाँ", no: "नहीं", checking: "मूल्यांकन हो रहा है...", check: "पात्रता जांचें", matched: "पात्रता मानदंड मेल खाते हैं", unmet: "कुछ मानदंड पूरे नहीं हुए", matchedCriteria: "मेल खाते मानदंड", missingCriteria: "अपूर्ण मानदंड", noMatched: "कोई मानदंड मेल नहीं खाता।", allMet: "सभी उपलब्ध मानदंड पूरे हैं।", guidance: "मार्गदर्शन", documents: "आवश्यक दस्तावेज़", help: "योजना समझने में सहायता चाहिए?", helpText: "अपनी पसंदीदा भाषा में सहायता और जानकारी पाएं।", ask: "मित्र से पूछें" },
  kn: { service: "ಅರ್ಹತಾ ಸೇವೆ", title: "ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ", intro: "ಆಯ್ದ ಯೋಜನೆಗೆ ಲಭ್ಯವಿರುವ ಅರ್ಹತಾ ಮಾನದಂಡಗಳೊಂದಿಗೆ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಹೋಲಿಸಲು ಕೆಲವು ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ.", note: "ಫಲಿತಾಂಶಗಳು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ; ಅರ್ಜಿಗೂ ಮುನ್ನ ಸಂಬಂಧಿತ ಯೋಜನಾ ಪ್ರಾಧಿಕಾರದಿಂದ ಪರಿಶೀಲಿಸಿ.", scheme: "ಯೋಜನೆ", applicant: "ಅರ್ಜಿದಾರರ ವಿಧ", land: "ಭೂ ಹಿಡುವಳಿ", membership: "ಪಿಎಸಿಎಸ್ / ಸಹಕಾರಿ ಸದಸ್ಯತ್ವ", farmer: "ವೈಯಕ್ತಿಕ ರೈತ", pacs: "ಪಿಎಸಿಎಸ್ / ಸಹಕಾರಿ ಸಂಘ", fpo: "ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ", shg: "ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಗುಂಪು", artisan: "ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿ / ಸೂಕ್ಷ್ಮ ಸಹಕಾರಿ", landPlaceholder: "ಉದಾ. 5.0 ಎಕರೆ", yes: "ಹೌದು", no: "ಇಲ್ಲ", checking: "ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...", check: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ", matched: "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಹೊಂದಿಕೆಯಾಗಿವೆ", unmet: "ಕೆಲವು ಮಾನದಂಡಗಳು ಈಡೇರಿಲ್ಲ", matchedCriteria: "ಹೊಂದಿದ ಮಾನದಂಡಗಳು", missingCriteria: "ಬಾಕಿ ಇರುವ ಮಾನದಂಡಗಳು", noMatched: "ಯಾವುದೇ ಮಾನದಂಡಗಳು ಹೊಂದಿಲ್ಲ.", allMet: "ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಮಾನದಂಡಗಳು ಈಡೇರಿವೆ.", guidance: "ಮಾರ್ಗದರ್ಶನ", documents: "ಅಗತ್ಯ ದಾಖಲೆಗಳು", help: "ಯೋಜನೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಬೇಕೇ?", helpText: "ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ಸಹಾಯ ಮತ್ತು ಮಾಹಿತಿ ಪಡೆಯಿರಿ.", ask: "ಮಿತ್ರರನ್ನು ಕೇಳಿ" },
  mr: { service: "पात्रता सेवा", title: "तुमची पात्रता तपासा", intro: "निवडलेल्या योजनेसाठी उपलब्ध पात्रता निकषांशी तुमची माहिती तुलना करण्यासाठी काही तपशील भरा.", note: "निकाल मार्गदर्शनासाठी आहेत; अर्जापूर्वी संबंधित योजना प्राधिकरणाकडून पडताळा.", scheme: "योजना", applicant: "अर्जदाराचा प्रकार", land: "जमीन धारणा", membership: "पॅक्स / सहकारी सदस्यत्व", farmer: "वैयक्तिक शेतकरी", pacs: "पॅक्स / सहकारी संस्था", fpo: "शेतकरी उत्पादक संस्था", shg: "महिला बचत गट", artisan: "ग्रामीण कारागीर / सूक्ष्म सहकारी", landPlaceholder: "उदा. 5.0 एकर", yes: "होय", no: "नाही", checking: "मूल्यांकन सुरू आहे...", check: "पात्रता तपासा", matched: "पात्रता निकष जुळले", unmet: "काही निकष पूर्ण झालेले नाहीत", matchedCriteria: "जुळलेले निकष", missingCriteria: "अपूर्ण निकष", noMatched: "कोणतेही निकष जुळले नाहीत.", allMet: "सर्व उपलब्ध निकष पूर्ण झाले आहेत.", guidance: "मार्गदर्शन", documents: "आवश्यक दस्तऐवज", help: "योजना समजून घेण्यासाठी मदत हवी आहे?", helpText: "तुमच्या पसंतीच्या भाषेत मदत आणि माहिती मिळवा.", ask: "मित्राला विचारा" },
  te: { service: "అర్హత సేవ", title: "మీ అర్హతను తనిఖీ చేయండి", intro: "ఎంచుకున్న పథకానికి అందుబాటులో ఉన్న అర్హత ప్రమాణాలతో మీ వివరాలను పోల్చడానికి కొన్ని వివరాలను నమోదు చేయండి.", note: "ఫలితాలు మార్గదర్శకం కోసం మాత్రమే; దరఖాస్తుకు ముందు సంబంధిత పథక అధికారితో ధృవీకరించండి.", scheme: "పథకం", applicant: "దరఖాస్తుదారు రకం", land: "భూమి విస్తీర్ణం", membership: "పీఏసీఎస్ / సహకార సభ్యత్వం", farmer: "వ్యక్తిగత రైతు", pacs: "పీఏసీఎస్ / సహకార సంఘం", fpo: "రైతు ఉత్పత్తిదారుల సంస్థ", shg: "మహిళా స్వయం సహాయక బృందం", artisan: "గ్రామీణ కళాకారుడు / సూక్ష్మ సహకారం", landPlaceholder: "ఉదా. 5.0 ఎకరాలు", yes: "అవును", no: "కాదు", checking: "మూల్యాంకనం జరుగుతోంది...", check: "అర్హతను తనిఖీ చేయండి", matched: "అర్హత ప్రమాణాలు సరిపోలాయి", unmet: "కొన్ని ప్రమాణాలు నెరవేరలేదు", matchedCriteria: "సరిపోలిన ప్రమాణాలు", missingCriteria: "లేని ప్రమాణాలు", noMatched: "ఏ ప్రమాణాలు సరిపోలలేదు.", allMet: "అందుబాటులో ఉన్న అన్ని ప్రమాణాలు నెరవేరాయి.", guidance: "మార్గదర్శకం", documents: "అవసరమైన పత్రాలు", help: "పథకాన్ని అర్థం చేసుకోవడంలో సహాయం కావాలా?", helpText: "మీకు నచ్చిన భాషలో సహాయం మరియు సమాచారం పొందండి.", ask: "మిత్రను అడగండి" },
} as const;

interface Scheme {
  id: number;
  code: string;
  title_en: string;
  title_hi: string;
  title_kn: string;
  title_mr?: string;
  title_te?: string;
  category: string;
  ministry_or_agency: string;
  target_beneficiaries: string[];
  description_en: string;
  description_hi: string;
  description_kn: string;
  description_mr?: string;
  description_te?: string;
  eligibility_criteria: {
    requires_pacs_membership?: boolean;
    allowed_applicant_types?: string[];
    max_land_acres?: number;
    min_land_acres?: number;
    documents_required?: string[];
  };
  benefits_summary: string;
  application_process: string;
  source_type: "OFFICIAL" | "PLACEHOLDER";
  source_citation: string;
  official_url?: string | null;
  is_active: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  confidence_score: number;
  scheme_name: string;
  matched_criteria: string[];
  missing_criteria: string[];
  recommendations: string;
  required_documents: string[];
  official_disclaimer: string;
}

export default function SchemesPage() {
  const { language } = useLanguage();
  const et = eligibilityText[language];

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("ALL");

  const [quizSchemeCode, setQuizSchemeCode] = useState("");
  const [quizApplicantType, setQuizApplicantType] =
    useState("INDIVIDUAL_FARMER");
  const [quizIsPacsMember, setQuizIsPacsMember] = useState(true);
  const [quizLandHolding, setQuizLandHolding] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  /* -------------------------------------------------------
     FETCH
  ------------------------------------------------------- */

  const fetchSchemes = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.getSchemes();

      setSchemes(data);

      if (data.length > 0 && !quizSchemeCode) {
        setQuizSchemeCode(data[0].code);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Unable to fetch schemes from server. Please verify backend connectivity.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      if (
        selectedCategory !== "ALL" &&
        scheme.category.toUpperCase() !== selectedCategory.toUpperCase()
      ) {
        return false;
      }

      if (selectedBeneficiary !== "ALL") {
        const matchesBeneficiary = (
          scheme.target_beneficiaries || []
        ).some((beneficiary) =>
          beneficiary
            .toLowerCase()
            .includes(selectedBeneficiary.toLowerCase()),
        );

        if (!matchesBeneficiary) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();

        const matchesTitle =
          scheme.title_en.toLowerCase().includes(query) ||
          scheme.title_hi.toLowerCase().includes(query) ||
          scheme.title_kn.toLowerCase().includes(query) ||
          (scheme.title_mr || "").toLowerCase().includes(query) ||
          (scheme.title_te || "").toLowerCase().includes(query);

        const matchesDescription =
          scheme.description_en.toLowerCase().includes(query) ||
          scheme.description_hi.toLowerCase().includes(query) ||
          scheme.description_kn.toLowerCase().includes(query) ||
          (scheme.description_mr || "").toLowerCase().includes(query) ||
          (scheme.description_te || "").toLowerCase().includes(query);

        const matchesCode = scheme.code.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDescription && !matchesCode) {
          return false;
        }
      }

      return true;
    });
  }, [
    schemes,
    selectedCategory,
    selectedBeneficiary,
    searchQuery,
  ]);

  /* -------------------------------------------------------
     ELIGIBILITY
  ------------------------------------------------------- */

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizSchemeCode) {
      return;
    }

    setIsEvaluating(true);
    setQuizError(null);
    setEligibilityResult(null);

    try {
      const payload = {
        scheme_code: quizSchemeCode,
        applicant_type: quizApplicantType,
        is_pacs_member: quizIsPacsMember,
        land_holding_acres: quizLandHolding
          ? parseFloat(quizLandHolding)
          : undefined,
      };

      const result = await api.checkEligibility(payload);

      setEligibilityResult(result);
    } catch (err: any) {
      setQuizError(
        err.message ||
          "Eligibility evaluation failed. Please verify your inputs.",
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  /* -------------------------------------------------------
     LANGUAGE HELPERS
  ------------------------------------------------------- */

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

    return scheme.title_en;
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

    return scheme.description_en;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedBeneficiary("ALL");
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f4f6f3] text-slate-900">

      {/* =================================================
          HERO / REGISTRY HEADER
      ================================================== */}

      <section className="bg-[#173b2a] text-white">
        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:py-14">

          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-emerald-300/30 bg-white/5">
                  <Landmark className="h-4 w-4 text-[#dcae2f]" />
                </span>

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dcae2f]">
                  Government Support
                </span>
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {language === "hi"
                  ? "योजना एवं सहायता रजिस्ट्री"
                  : language === "kn"
                    ? "ಯೋಜನೆ ಮತ್ತು ಸಹಾಯಧನ ನೋಂದಣಿ"
                    : language === "mr"
                      ? "योजना आणि सहाय्य नोंदणी"
                      : language === "te"
                        ? "పథకాలు మరియు సహాయ రిజిస్ట్రీ"
                        : "Scheme & Support Registry"}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                {language === "hi"
                  ? "सहकारी समितियों, किसानों और ग्रामीण संस्थाओं के लिए उपलब्ध सरकारी योजनाओं और सहायता की जानकारी एक ही स्थान पर।"
                  : language === "kn"
                    ? "ಸಹಕಾರಿ ಸಂಘಗಳು, ರೈತರು ಮತ್ತು ಗ್ರಾಮೀಣ ಸಂಸ್ಥೆಗಳಿಗಾಗಿ ಲಭ್ಯವಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯದ ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಪಡೆಯಿರಿ."
                    : language === "mr"
                      ? "सहकारी संस्था, शेतकरी आणि ग्रामीण संस्थांसाठी उपलब्ध सरकारी योजना आणि सहाय्याची माहिती एका ठिकाणी मिळवा."
                      : language === "te"
                        ? "సహకార సంఘాలు, రైతులు మరియు గ్రామీణ సంస్థలకు అందుబాటులో ఉన్న ప్రభుత్వ పథకాలు మరియు సహాయ సమాచారాన్ని ఒకే చోట పొందండి."
                        : "Explore government schemes and support available to cooperatives, farmers and rural institutions in one place."}
              </p>

            </div>

            {/* ONLY SCHEME COUNT — LANGUAGES REMOVED */}

            <div className="border border-white/15 bg-[#173b2a]">
              <div className="px-8 py-6">
                <div className="text-4xl font-semibold">
                  {filteredSchemes.length
                    .toString()
                    .padStart(2, "0")}
                </div>

                <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-200/70">
                  {language === "hi"
                    ? "उपलब्ध योजनाएं"
                    : language === "kn"
                      ? "ಲಭ್ಯ ಯೋಜನೆಗಳು"
                      : language === "mr"
                        ? "उपलब्ध योजना"
                        : language === "te"
                          ? "అందుబాటులోని పథకాలు"
                          : "Available schemes"}
                </div>
              </div>
            </div>

          </div>

          {/* SEARCH */}

          <div className="mt-10 flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "योजना, कोड या कीवर्ड खोजें"
                    : language === "kn"
                      ? "ಯೋಜನೆ, ಕೋಡ್ ಅಥವಾ ಕೀವರ್ಡ್ ಹುಡುಕಿ"
                      : language === "mr"
                        ? "योजना, कोड किंवा कीवर्ड शोधा"
                        : language === "te"
                          ? "పథకం, కోడ్ లేదా కీవర్డ్ కోసం వెతకండి"
                          : "Search schemes, codes or keywords"
                }
                className="h-14 w-full border border-white/15 bg-white px-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400"
              />

            </div>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("eligibility-calculator")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="flex h-14 items-center justify-center gap-2 bg-[#d7a52b] px-7 text-sm font-bold text-[#173b2a] transition hover:bg-[#e3b63c]"
            >
              <CheckCircle2 className="h-4 w-4" />

              {language === "hi"
                ? "पात्रता जांचें"
                : language === "kn"
                  ? "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ"
                  : language === "mr"
                    ? "पात्रता तपासा"
                    : language === "te"
                      ? "అర్హతను తనిఖీ చేయండి"
                      : "Check eligibility"}
            </button>

          </div>

        </div>
      </section>


      {/* =================================================
          FILTER BAR
      ================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap items-center gap-2">

            <span className="mr-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </span>

            {[
              ["ALL", "All"],
              ["INFRASTRUCTURE", "Infrastructure"],
              ["YOUTH", "Youth"],
              ["CREDIT", "Credit"],
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() => setSelectedCategory(value)}
                className={`border px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === value
                    ? "border-[#173b2a] bg-[#173b2a] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#173b2a] hover:text-[#173b2a]"
                }`}
              >
                {value === "ALL"
                  ? language === "hi"
                    ? "सभी"
                    : language === "kn"
                      ? "ಎಲ್ಲಾ"
                      : language === "mr"
                        ? "सर्व"
                        : language === "te"
                          ? "అన్ని"
                          : label
                  : label}
              </button>

            ))}

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-[#1c8b4c]" />

            <span>
              {filteredSchemes.length}{" "}
              {language === "hi"
                ? "योजनाएं"
                : language === "kn"
                  ? "ಯೋಜನೆಗಳು"
                  : language === "mr"
                    ? "योजना"
                    : language === "te"
                      ? "పథకాలు"
                      : "schemes"}
            </span>

            {(searchQuery ||
              selectedCategory !== "ALL" ||
              selectedBeneficiary !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-2 font-semibold text-[#1c8b4c] underline underline-offset-2"
              >
                Reset
              </button>
            )}
          </div>

        </div>

      </section>


      {/* =================================================
          DIRECTORY
      ================================================== */}

      <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">

        <div className="mb-8 flex items-end justify-between">

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#1c8b4c]">
              Directory
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {language === "hi"
                ? "उपलब्ध योजनाएं"
                : language === "kn"
                  ? "ಲಭ್ಯವಿರುವ ಯೋಜನೆಗಳು"
                  : language === "mr"
                    ? "उपलब्ध योजना"
                    : language === "te"
                      ? "అందుబాటులో ఉన్న పథకాలు"
                      : "Available Schemes"}
            </h2>
          </div>

          <div className="hidden text-xs text-slate-400 sm:block">
            {filteredSchemes.length
              .toString()
              .padStart(2, "0")}{" "}
            PROGRAMS
          </div>

        </div>


        {/* LOADING */}

        {isLoading && (
          <div className="space-y-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse border border-slate-200 bg-white"
              />
            ))}

          </div>
        )}


        {/* ERROR */}

        {!isLoading && errorMsg && (
          <div className="border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />

              <div className="flex-1">

                <p className="text-sm font-semibold text-red-800">
                  {errorMsg}
                </p>

                <button
                  type="button"
                  onClick={fetchSchemes}
                  className="mt-3 text-xs font-bold text-red-700 underline"
                >
                  Retry
                </button>

              </div>

            </div>

          </div>
        )}


        {/* EMPTY */}

        {!isLoading &&
          !errorMsg &&
          filteredSchemes.length === 0 && (
            <div className="border border-slate-200 bg-white px-6 py-20 text-center">

              <FileText className="mx-auto h-8 w-8 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">
                No schemes found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-[#1c8b4c] underline"
              >
                Reset filters
              </button>

            </div>
          )}


        {/* SCHEME LIST */}

        {!isLoading &&
          !errorMsg &&
          filteredSchemes.length > 0 && (

            <div className="space-y-3">

              {filteredSchemes.map((scheme, index) => {

                const isOfficial =
                  scheme.source_type === "OFFICIAL";

                return (
                  <article
                    key={scheme.id}
                    className="group relative overflow-hidden border border-slate-200 bg-white transition hover:border-[#1c8b4c] hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]"
                  >

                    {/* ACCENT */}

                    <div
                      className={`absolute left-0 top-0 h-full w-1 ${
                        isOfficial
                          ? "bg-[#1c8b4c]"
                          : "bg-[#d7a52b]"
                      }`}
                    />

                    <div className="grid lg:grid-cols-[80px_1fr_190px]">

                      {/* NUMBER */}

                      <div className="hidden border-r border-slate-100 px-5 py-6 lg:block">

                        <div className="font-mono text-sm font-bold text-slate-300">
                          {(index + 1)
                            .toString()
                            .padStart(2, "0")}
                        </div>

                      </div>


                      {/* INFORMATION */}

                      <div className="min-w-0 px-6 py-6">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c8b4c]">
                            {scheme.category}
                          </span>

                          <span className="text-slate-300">
                            /
                          </span>

                          <span className="font-mono text-[10px] text-slate-400">
                            {scheme.code}
                          </span>

                        </div>

                        <h3 className="mt-3 max-w-3xl text-xl font-semibold leading-7 text-slate-900 transition group-hover:text-[#176d3d]">
                          {getSchemeTitle(scheme)}
                        </h3>

                        <div className="mt-1 text-xs font-medium text-slate-500">
                          {scheme.ministry_or_agency}
                        </div>

                        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                          {getSchemeDescription(scheme)}
                        </p>

                        {scheme.target_beneficiaries &&
                          scheme.target_beneficiaries.length >
                            0 && (
                            <div className="mt-5 flex flex-wrap gap-2">

                              {scheme.target_beneficiaries
                                .slice(0, 4)
                                .map(
                                  (
                                    beneficiary,
                                    beneficiaryIndex,
                                  ) => (
                                    <span
                                      key={
                                        beneficiaryIndex
                                      }
                                      className="border border-slate-200 bg-[#f8faf8] px-2.5 py-1 text-[11px] text-slate-600"
                                    >
                                      {beneficiary}
                                    </span>
                                  ),
                                )}

                            </div>
                          )}

                      </div>


                      {/* ACTION PANEL */}

                      <div className="flex flex-col justify-between border-t border-slate-100 bg-[#fafcf9] px-6 py-6 lg:border-l lg:border-t-0">

                        <div>

                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Source
                          </div>

                          <div
                            className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                              isOfficial
                                ? "text-[#1c8b4c]"
                                : "text-[#9a6a00]"
                            }`}
                          >
                            {isOfficial ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}

                            {isOfficial
                              ? "Official source"
                              : "Placeholder source"}
                          </div>

                        </div>


                        <div className="mt-6 space-y-2">

                          {scheme.official_url && (
                            <a
                              href={scheme.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-9 items-center justify-center gap-2 border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:border-[#1c8b4c] hover:text-[#1c8b4c]"
                            >
                              Official portal
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setQuizSchemeCode(
                                scheme.code,
                              );

                              document
                                .getElementById(
                                  "eligibility-calculator",
                                )
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                });
                            }}
                            className="flex h-10 w-full items-center justify-center gap-2 bg-[#1c8b4c] text-xs font-bold text-white hover:bg-[#176d3d]"
                          >
                            {et.check}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </section>


      {/* =================================================
          ELIGIBILITY SERVICE
      ================================================== */}

      <section
        id="eligibility-calculator"
        className="scroll-mt-20 border-y border-slate-200 bg-white"
      >

        <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">

            {/* INTRO */}

            <div>

              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#1c8b4c]">
                {et.service}
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {et.title}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                {et.intro}
              </p>

              <div className="mt-8 border-l-2 border-[#d7a52b] pl-4 text-xs leading-5 text-slate-500">
                {et.note}
              </div>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleCheckEligibility}
              className="border border-slate-200 bg-[#f8faf8] p-6 sm:p-8"
            >

              <div className="grid gap-6 sm:grid-cols-2">

                {/* SCHEME */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.scheme}
                  </label>

                  <select
                    value={quizSchemeCode}
                    onChange={(e) =>
                      setQuizSchemeCode(e.target.value)
                    }
                    className="h-12 w-full border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1c8b4c] focus:ring-1 focus:ring-[#1c8b4c]"
                  >
                    {schemes.map((scheme) => (
                      <option
                        key={scheme.code}
                        value={scheme.code}
                      >
                        {getSchemeTitle(scheme)} (
                        {scheme.code})
                      </option>
                    ))}
                  </select>

                </div>


                {/* APPLICANT */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.applicant}
                  </label>

                  <select
                    value={quizApplicantType}
                    onChange={(e) =>
                      setQuizApplicantType(e.target.value)
                    }
                    className="h-12 w-full border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1c8b4c] focus:ring-1 focus:ring-[#1c8b4c]"
                  >
                    <option value="INDIVIDUAL_FARMER">
                      {et.farmer}
                    </option>

                    <option value="PACS">
                      {et.pacs}
                    </option>

                    <option value="FPO">
                      {et.fpo}
                    </option>

                    <option value="WOMEN_SHG">
                      {et.shg}
                    </option>

                    <option value="ARTISAN">
                      {et.artisan}
                    </option>
                  </select>

                </div>


                {/* LAND */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.land}
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={quizLandHolding}
                    onChange={(e) =>
                      setQuizLandHolding(e.target.value)
                    }
                    placeholder={et.landPlaceholder}
                    className="h-12 w-full border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1c8b4c] focus:ring-1 focus:ring-[#1c8b4c]"
                  />

                </div>


                {/* PACS */}

                <div className="sm:col-span-2">

                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.membership}
                  </label>

                  <div className="flex gap-3">

                    <label className="flex flex-1 cursor-pointer items-center gap-3 border border-slate-200 bg-white px-4 py-3 text-sm hover:border-[#1c8b4c]">

                      <input
                        type="radio"
                        name="pacs_member"
                        checked={
                          quizIsPacsMember === true
                        }
                        onChange={() =>
                          setQuizIsPacsMember(true)
                        }
                        className="accent-[#1c8b4c]"
                      />

                      {et.yes}

                    </label>

                    <label className="flex flex-1 cursor-pointer items-center gap-3 border border-slate-200 bg-white px-4 py-3 text-sm hover:border-[#1c8b4c]">

                      <input
                        type="radio"
                        name="pacs_member"
                        checked={
                          quizIsPacsMember === false
                        }
                        onChange={() =>
                          setQuizIsPacsMember(false)
                        }
                        className="accent-[#1c8b4c]"
                      />

                      {et.no}

                    </label>

                  </div>

                </div>

              </div>


              {quizError && (
                <div className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {quizError}
                </div>
              )}


              <button
                type="submit"
                disabled={isEvaluating}
                className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-[#173b2a] text-sm font-bold text-white transition hover:bg-[#0f2d20] disabled:bg-slate-300"
              >

                {isEvaluating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {et.checking}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {et.check}
                  </>
                )}

              </button>

            </form>

          </div>


          {/* =================================================
              RESULT
          ================================================== */}

          {eligibilityResult && (

            <div className="mt-10 border border-slate-200">

              <div
                className={`flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-center sm:justify-between ${
                  eligibilityResult.eligible
                    ? "bg-[#edf7ef]"
                    : "bg-[#fff8e8]"
                }`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 items-center justify-center ${
                      eligibilityResult.eligible
                        ? "bg-[#1c8b4c] text-white"
                        : "bg-[#c48b19] text-white"
                    }`}
                  >
                    {eligibilityResult.eligible ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6" />
                    )}
                  </div>

                  <div>

                    <div className="text-xs text-slate-500">
                      {eligibilityResult.scheme_name}
                    </div>

                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {eligibilityResult.eligible
                        ? et.matched
                        : et.unmet}
                    </div>

                  </div>

                </div>


              </div>


              {/* CRITERIA */}

              <div className="grid md:grid-cols-2">

                <div className="border-b border-slate-200 p-6 md:border-r md:border-b-0">

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.matchedCriteria}
                  </h3>

                  <div className="mt-4 space-y-2">

                    {eligibilityResult.matched_criteria
                      .length > 0 ? (
                      eligibilityResult.matched_criteria.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex gap-3 text-sm text-slate-700"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1c8b4c]" />

                            {item}
                          </div>
                        ),
                      )
                    ) : (
                      <span className="text-sm text-slate-500">
                        {et.noMatched}
                      </span>
                    )}

                  </div>

                </div>


                <div className="p-6">

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {et.missingCriteria}
                  </h3>

                  <div className="mt-4 space-y-2">

                    {eligibilityResult.missing_criteria
                      .length > 0 ? (
                      eligibilityResult.missing_criteria.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex gap-3 text-sm text-slate-700"
                          >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#c48b19]" />

                            {item}
                          </div>
                        ),
                      )
                    ) : (
                      <span className="text-sm text-[#1c8b4c]">
                        {et.allMet}
                      </span>
                    )}

                  </div>

                </div>

              </div>


              {/* GUIDANCE */}

              <div className="border-t border-slate-200 bg-slate-50 p-6">

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {et.guidance}
                </h3>

                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
                  {eligibilityResult.recommendations}
                </p>

              </div>


              {/* DOCUMENTS */}

              {eligibilityResult.required_documents &&
                eligibilityResult.required_documents.length >
                  0 && (

                  <div className="border-t border-slate-200 p-6">

                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">

                      <FileCheck className="h-4 w-4 text-[#1c8b4c]" />

                      {et.documents}

                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">

                      {eligibilityResult.required_documents.map(
                        (document, index) => (
                          <span
                            key={index}
                            className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                          >
                            {document}
                          </span>
                        ),
                      )}

                    </div>

                  </div>
                )}


              {/* DISCLAIMER */}

              <div className="border-t border-slate-200 bg-[#fafaf8] p-5 text-xs leading-5 text-slate-500">
                {eligibilityResult.official_disclaimer}
              </div>

            </div>
          )}

        </div>

      </section>


      {/* =================================================
          MITRA HELP
      ================================================== */}

      <section className="bg-[#f4f6f3]">

        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">

          <div className="flex flex-col gap-5 border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#1c8b4c]">
                Cooperative Mitra
              </div>

              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {et.help}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {et.helpText}
              </p>

            </div>

            <Link
              href="/chat"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#173b2a] px-6 text-sm font-bold text-white hover:bg-[#0f2d20]"
            >
              {et.ask}
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
