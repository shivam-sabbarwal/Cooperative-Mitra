"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
} from "lucide-react";

interface CitationSource {
  title: string;
  doc_id: string;
  section?: string;
  source_type: string;
  source_url?: string;
  excerpt?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  audio_url?: string | null;
  citations?: CitationSource[];
  intent?: string;
  provider_used?: string;
  verification_status?: string;
  timestamp: Date;
}

interface ChatSessionSummary {
  session_id: string;
  title: string;
  language: string;
  created_at: string;
  message_count: number;
}

export default function ChatPage() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [enableVoiceReply, setEnableVoiceReply] = useState(false);

  // Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Expandable citations
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});

  // Past sessions
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(false);
  // Source-aware answers must remain auditable for public-service guidance.
  const showSourceDetails = true;

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const conversationRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------
  // Welcome Message
  // ---------------------------------------------------------

  useEffect(() => {
    const welcomeTexts: Record<Language, string> = {
      en: "Welcome to Cooperative Mitra. Ask a question about PACS services, cooperative rules, government schemes, loans, or grievance procedures.",

      hi: "सहकारी मित्र में आपका स्वागत है। पैक्स सेवाओं, सहकारी नियमों, सरकारी योजनाओं, ऋण या शिकायत प्रक्रिया के बारे में प्रश्न पूछें।",

      kn: "ಸಹಕಾರಿ ಮಿತ್ರಕ್ಕೆ ಸ್ವಾಗತ. ಪ್ಯಾಕ್ಸ್ ಸೇವೆಗಳು, ಸಹಕಾರ ನಿಯಮಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸಾಲ ಅಥವಾ ದೂರು ಪ್ರಕ್ರಿಯೆಯ ಕುರಿತು ಪ್ರಶ್ನೆ ಕೇಳಿ.",

      mr: "सहकारी मित्रमध्ये आपले स्वागत आहे. पॅक्स सेवा, सहकारी नियम, सरकारी योजना, कर्ज किंवा तक्रार प्रक्रियेबद्दल प्रश्न विचारा.",

      te: "సహకార మిత్రకు స్వాగతం. ప్యాక్స్ సేవలు, సహకార నియమాలు, ప్రభుత్వ పథకాలు, రుణాలు లేదా ఫిర్యాదు ప్రక్రియ గురించి ప్రశ్న అడగండి.",
    };

    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: welcomeTexts[language] || welcomeTexts.en,
        language,
        verification_status: "VERIFIED",
        citations: [],
        timestamp: new Date(),
      },
    ]);
  }, [language]);

  // ---------------------------------------------------------
  // Load User Sessions
  // ---------------------------------------------------------

  useEffect(() => {
    if (user) {
      api
        .getChatSessions()
        .then((data) => setSessions(data))
        .catch(() => {});
    }
  }, [user]);

  // ---------------------------------------------------------
  // Scroll
  // ---------------------------------------------------------

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // ---------------------------------------------------------
  // Cleanup Audio
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------
  // Quick Prompts
  // ---------------------------------------------------------

  const quickPrompts: Record<Language, string[]> = {
    en: [
      "What are the benefits of PACS Computerization Scheme?",
      "How does the Modified Interest Subvention Scheme (MISS) work?",
      "What are the loan recovery rules in Model PACS Bye-laws?",
      "Explain eligibility for Yuva Sahakar cooperative scheme",
    ],

    hi: [
      "पैक्स कम्प्यूटरीकरण योजना के क्या लाभ हैं?",
      "ब्याज सबवेंशन योजना (MISS) के तहत कितना अनुदान मिलता है?",
      "मॉडल पैक्स उप-नियमों के अनुसार ऋण वसूली के क्या नियम हैं?",
      "युवा सहकार योजना की पात्रता और सहायता क्या है?",
    ],

    kn: [
      "ಪ್ಯಾಕ್ಸ್ ಗಣಕೀಕರಣ ಯೋಜನೆಯ ಪ್ರಯೋಜನಗಳೇನು?",
      "ಬಡ್ಡಿದರ ರಿಯಾಯಿತಿ (MISS) ಮೂಲಕ ಎಷ್ಟು ಬೆಳೆ ಸಾಲ ಸಿಗುತ್ತದೆ?",
      "ಮಾದರಿ ಉಪನಿಯಮಗಳ ಪ್ರಕಾರ ಸಾಲ ವಸೂಲಾತಿ ನಿಯಮಗಳೇನು?",
      "ಯುವ ಸಹಕಾರ ಯೋಜನೆಯಡಿ ಯಾರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?",
    ],

    mr: [
      "पॅक्स संगणकीकरण योजनेचे मुख्य फायदे काय आहेत?",
      "सुधारित व्याज अनुदान योजना (MISS) अंतर्गत किती सवलत मिळते?",
      "मॉडेल पॅक्स उपनियमांनुसार कर्ज वसुलीचे नियम काय आहेत?",
      "युवा सहकार सहकारी योजनेची पात्रता व साहाय्य काय आहे?",
    ],

    te: [
      "ప్యాక్స్ కంప్యూటరీకరణ పథకం వల్ల కలిగే ప్రయోజనాలు ఏమిటి?",
      "సవరించిన వడ్డీ రాయితీ పథకం (MISS) ఎలా పనిచేస్తుంది?",
      "మోడల్ ప్యాక్స్ నిబంధనల ప్రకారం రుణ వసూలు నియమాలు ఏమిటి?",
      "యువ సహకార పథకానికి ఎవరు అర్హులు మరియు సహాయం ఏమిటి?",
    ],
  };

  // ---------------------------------------------------------
  // Send Message
  // ---------------------------------------------------------

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();

    if (!query || isLoading) return;

    setErrorMsg(null);
    setInputText("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      language,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: query,
        session_id: sessionId || undefined,
        language,
        enable_voice_response: enableVoiceReply,
      });

      if (res.session_id) {
        setSessionId(res.session_id);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        language: res.language,
        audio_url: res.audio_url,
        citations: res.citations || [],
        intent: res.intent,
        provider_used: res.provider_used,
        verification_status:
          res.verification_status ||
          (res.grounded ? "VERIFIED" : "UNABLE_TO_VERIFY"),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (res.audio_url) {
        handlePlayAudio(assistantMessage.id, res.audio_url);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Failed to reach Cooperative Mitra AI. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Audio Playback
  // ---------------------------------------------------------

  const handlePlayAudio = (
    messageId: string,
    audioUrl?: string | null
  ) => {
    if (playingAudioId === messageId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setPlayingAudioId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (!audioUrl) return;

    const fullUrl = api.getAudioUrl(audioUrl);
    const audio = new Audio(fullUrl);

    currentAudioRef.current = audio;
    setPlayingAudioId(messageId);

    audio.onended = () => {
      setPlayingAudioId(null);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      setPlayingAudioId(null);
      currentAudioRef.current = null;
    };

    audio.play().catch(() => {
      setPlayingAudioId(null);
      currentAudioRef.current = null;
    });
  };

  // ---------------------------------------------------------
  // TTS
  // ---------------------------------------------------------

  const handleGenerateTTS = async (
    messageId: string,
    text: string
  ) => {
    try {
      const res = await api.generateTTS(text, language);

      if (res.audio_url) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, audio_url: res.audio_url }
              : m
          )
        );

        handlePlayAudio(messageId, res.audio_url);
      }
    } catch (err) {
      console.error("TTS generation error", err);
    }
  };

  // ---------------------------------------------------------
  // Voice Input
  // ---------------------------------------------------------

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;

        // Five-language speech recognition mapping
        const langMap: Record<Language, string> = {
          en: "en-IN",
          hi: "hi-IN",
          kn: "kn-IN",
          mr: "mr-IN",
          te: "te-IN",
        };

        recognition.lang = langMap[language] || "en-IN";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");

          setInputText(transcript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          startMediaRecorderFallback();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();

        return;
      } catch (err) {
        console.warn(
          "Web Speech API error, falling back to MediaRecorder",
          err
        );
      }
    }

    startMediaRecorderFallback();
  };

  // ---------------------------------------------------------
  // MediaRecorder Fallback
  // ---------------------------------------------------------

  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const audioFile = new File(
          [audioBlob],
          "speech.webm",
          { type: "audio/webm" }
        );

        setIsLoading(true);

        try {
          const res = await api.transcribeAudio(
            audioFile,
            language
          );

          if (res.text) {
            setInputText(res.text);
          }
        } catch (err: any) {
          setErrorMsg(
            "Could not transcribe voice audio: " +
              err.message
          );
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setErrorMsg(
        "Microphone permission required for voice input."
      );
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}

      recognitionRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
  };

  // ---------------------------------------------------------
  // Citations
  // ---------------------------------------------------------

  const toggleCitations = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // ---------------------------------------------------------
  // New Chat
  // ---------------------------------------------------------

  const handleNewChat = () => {
    setSessionId(null);

    const welcomeTexts: Record<Language, string> = {
      en: "Starting a new consultation session. How can Cooperative Mitra assist your society or farm today?",

      hi: "नया परामर्श सत्र प्रारंभ हुआ। सहकारी मित्र आपकी समिति या खेती के लिए कैसे सहायता कर सकता है?",

      kn: "ಹೊಸ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭವಾಗಿದೆ. ಸಹಕಾರಿ ಮಿತ್ರ ನಿಮಗೆ ಹೇಗೆ ನೆರವಾಗಬಹುದು?",

      mr: "नवीन सल्लामसलत सत्र सुरू झाले आहे. सहकारी मित्र आपल्या संस्था किंवा शेतीसाठी आज कशी मदत करू शकतो?",

      te: "కొత్త సంప్రదింపు సెషన్ ప్రారంభమైంది. సహకార మిత్ర మీ సంఘం లేదా వ్యవసాయానికి ఈరోజు ఎలా సహాయం చేయగలడు?",
    };

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: welcomeTexts[language] || welcomeTexts.en,
        language,
        verification_status: "VERIFIED",
        timestamp: new Date(),
      },
    ]);
  };

  // ---------------------------------------------------------
  // Load Existing Session
  // ---------------------------------------------------------

  const handleLoadSession = async (sessUuid: string) => {
    setIsLoading(true);

    try {
      const history = await api.getChatHistory(sessUuid);

      setSessionId(history.session_uuid);

      const loadedMessages: ChatMessage[] =
        history.messages.map((m: any) => ({
          id: `msg-${m.id}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          language: m.language,
          audio_url: m.audio_url,
          citations: m.citations || [],
          intent: m.intent,
          provider_used: m.provider_used,
          verification_status:
            m.role === "assistant"
              ? "VERIFIED"
              : undefined,
          timestamp: new Date(m.created_at),
        }));

      setMessages(loadedMessages);
      setShowSessionsSidebar(false);
    } catch (err: any) {
      setErrorMsg(
        "Failed to load conversation history: " +
          err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Language-specific Chat Header
  // ---------------------------------------------------------

  const chatTitles: Record<Language, string> = {
    en: "Cooperative Information Service",
    hi: "सहकारी सूचना सेवा",
    kn: "ಸಹಕಾರ ಮಾಹಿತಿ ಸೇವೆ",
    mr: "सहकारी माहिती सेवा",
    te: "సహకార సమాచార సేవ",
  };

  const chatDescriptions: Record<Language, string> = {
    en: "Ask a question and receive a clear, source-grounded response.",
    hi: "सत्यापित पैक्स उप-नियम, ऋण व कल्याणकारी योजनाएं",
    kn: "ಪರಿಶೀಲಿತ ಪ್ಯಾಕ್ಸ್ ನಿಯಮಗಳು ಹಾಗೂ ಸಾಲ ಯೋಜನೆಗಳು",
    mr: "पडताळलेले पॅक्स उपनियम, कल्याणकारी योजना आणि तक्रार मार्गदर्शन",
    te: "ధృవీకరించిన ప్యాక్స్ నిబంధనలు, సంక్షేమ పథకాలు మరియు ఫిర్యాదు మార్గదర్శనం",
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] min-w-0 max-w-7xl flex-col px-2 py-3 sm:px-4 sm:py-6 lg:px-8">

      {/* Top Header Card */}
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-coop-200 bg-white shadow-sm">
            <img src="/icon.svg" alt="" className="h-full w-full object-contain" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">

              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {chatTitles[language]}
              </h1>


            </div>

            <p className="hidden text-xs text-slate-500 sm:block">
              {chatDescriptions[language]}
            </p>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

          {/* Voice Toggle */}
          <button
            onClick={() =>
              setEnableVoiceReply(!enableVoiceReply)
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              enableVoiceReply
                ? "bg-coop-50 border-coop-300 text-coop-700 font-semibold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Automatically synthesize voice response"
          >
            {enableVoiceReply ? (
              <Volume2 className="w-3.5 h-3.5 text-coop-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}

            <span className="hidden md:inline">
              Auto Voice
            </span>
          </button>

          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Start New Conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              New enquiry
            </span>
          </button>

          {/* History */}
          {user && sessions.length > 0 && (
            <button
              onClick={() =>
                setShowSessionsSidebar(!showSessionsSidebar)
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="View History"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Previous enquiries ({sessions.length})
              </span>
            </button>
          )}

          {/* Mobile language dropdown uses the shared language context. */}
          <label className="sr-only" htmlFor="chat-language">Language</label>
          <select
            id="chat-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="block min-h-[36px] max-w-[92px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 sm:hidden"
            aria-label="Select chat language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="mr">मराठी</option>
            <option value="te">తెలుగు</option>
          </select>

          {/* Desktop language selector */}
          <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 sm:flex">

            {(
              ["en", "hi", "kn", "mr", "te"] as Language[]
            ).map((langCode) => (
              <button
                key={langCode}
                onClick={() => setLanguage(langCode)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  language === langCode
                    ? "bg-white text-coop-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {langCode === "en"
                  ? "EN"
                  : langCode === "hi"
                  ? "हिन्दी"
                  : langCode === "kn"
                  ? "ಕನ್ನಡ"
                  : langCode === "mr"
                  ? "मराठी"
                  : "తెలుగు"}
              </button>
            ))}

          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="relative flex min-h-0 min-w-0 flex-1 gap-4">

        {/* Past Sessions Drawer */}
        {showSessionsSidebar && user && (
          <div className="absolute inset-y-0 left-0 z-20 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col md:relative md:w-64 md:shadow-none">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">

              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Previous enquiries
              </h3>

              <button
                onClick={() =>
                  setShowSessionsSidebar(false)
                }
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>

            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">

              {sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() =>
                    handleLoadSession(s.session_id)
                  }
                  className={`w-full text-left p-2 rounded-xl text-xs transition-colors ${
                    sessionId === s.session_id
                      ? "bg-coop-50 text-coop-800 font-semibold border border-coop-200"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="truncate font-medium">
                    {s.title || "Consultation"}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>
                      {s.language.toUpperCase()}
                    </span>

                    <span>
                      {new Date(
                        s.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}

            </div>
          </div>
        )}

        {/* Question-and-answer record */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div ref={conversationRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

            {messages.map((msg) => {
              const isAssistant =
                msg.role === "assistant";

              const isPlaying =
                playingAudioId === msg.id;

              const hasCitations =
                msg.citations &&
                msg.citations.length > 0;

              const isExpanded =
                expandedSources[msg.id];

              return (
                <div
                  key={msg.id}
                  className="border-b border-slate-100 pb-5 last:border-b-0"
                >

                  {isAssistant && false && (
                    <div className="w-8 h-8 rounded-xl bg-coop-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                      सह
                    </div>
                  )}

                  <div
                    className={`w-full space-y-2 ${
                      isAssistant
                        ? "text-slate-800"
                        : "text-slate-800"
                    }`}
                  >

                    {/* Question or response */}
                    <div
                      className={`p-4 rounded-lg text-sm leading-relaxed ${
                        isAssistant
                          ? "bg-white border-l-4 border-coop-700 text-slate-800"
                          : "bg-[#f4f7f5] border border-slate-200 text-slate-800"
                      }`}
                    >

                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isAssistant ? "Information response" : "Your question"}
                      </div>

                      {/* Internal verification/provider metadata is not shown
                          in the public service view. */}
                      {isAssistant && false && (
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-200/80 text-[11px]">

                          <div className="flex items-center gap-1.5">

                            {msg.verification_status ===
                            "VERIFIED" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>
                                  Official Verified
                                </span>
                              </span>
                            ) : msg.verification_status ===
                              "PARTIALLY_VERIFIED" ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>
                                  Partially Verified
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                                <Info className="w-3 h-3" />
                                <span>
                                  General Guidance
                                </span>
                              </span>
                            )}

                            {msg.intent && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {msg.intent}
                              </span>
                            )}

                          </div>

                          {msg.provider_used && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {msg.provider_used.replace(
                                "_",
                                " "
                              )}
                            </span>
                          )}

                        </div>
                      )}

                      {/* Main Text */}
                      <p className="whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* Audio */}
                      {isAssistant && (
                        <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">

                          <button
                            onClick={() =>
                              msg.audio_url
                                ? handlePlayAudio(
                                    msg.id,
                                    msg.audio_url
                                  )
                                : handleGenerateTTS(
                                    msg.id,
                                    msg.content
                                  )
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                              isPlaying
                                ? "bg-coop-600 text-white animate-pulse"
                                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >

                            {isPlaying ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-coop-600" />
                            )}

                            <span>
                              {isPlaying
                                ? t.speaking
                                : "Listen (Voice)"}
                            </span>

                          </button>

                          <span className="text-[10px] text-slate-400">
                            {new Date(
                              msg.timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                        </div>
                      )}
                    </div>

                    {/* Citations */}
                    {showSourceDetails && isAssistant && hasCitations && (
                      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-2.5 text-xs">

                        <button
                          onClick={() =>
                            toggleCitations(msg.id)
                          }
                          className="w-full flex items-center justify-between text-slate-700 font-semibold hover:text-coop-700 transition-colors"
                        >

                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-coop-600" />

                            <span>
                              Official Citations & Sources (
                              {msg.citations!.length})
                            </span>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}

                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-slate-200">

                            {msg.citations!.map(
                              (cit, cIdx) => {
                                const isPlaceholder =
                                  cit.source_type ===
                                  "PLACEHOLDER";

                                return (
                                  <div
                                    key={cIdx}
                                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                                      isPlaceholder
                                        ? "bg-amber-50/70 border-amber-300 text-amber-900"
                                        : "bg-white border-slate-200 text-slate-800"
                                    }`}
                                  >

                                    <div className="flex items-start justify-between gap-2">

                                      <div className="font-semibold text-slate-900">
                                        {cit.title}
                                      </div>

                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                          isPlaceholder
                                            ? "bg-amber-200 text-amber-900 border border-amber-300"
                                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        }`}
                                      >
                                        {isPlaceholder
                                          ? "Placeholder — Not Official"
                                          : "Official Gazette"}
                                      </span>

                                    </div>

                                    {cit.section && (
                                      <div className="text-[11px] text-coop-700 font-medium">
                                        {cit.section}{" "}
                                        (Doc ID:{" "}
                                        {cit.doc_id})
                                      </div>
                                    )}

                                    {cit.excerpt && (
                                      <blockquote className="italic text-slate-600 border-l-2 border-slate-300 pl-2 text-[11px] mt-1 line-clamp-3">
                                        &ldquo;
                                        {cit.excerpt}
                                        &rdquo;
                                      </blockquote>
                                    )}

                                    {cit.source_url && (
                                      <a
                                        href={cit.source_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex text-[11px] font-semibold text-coop-700 underline hover:text-coop-900"
                                      >
                                        Open source
                                      </a>
                                    )}

                                  </div>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-xl bg-coop-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm animate-pulse">
                  सह
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-600 shadow-xs flex items-center gap-3">

                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-coop-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-coop-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-coop-600 animate-bounce" />
                  </div>

                  <span className="font-medium text-slate-500">
                    {language === "hi"
                      ? "सहकारी अभिलेखों में खोज जारी है..."
                      : language === "kn"
                      ? "ಸಹಕಾರ ದಾಖಲೆಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
                      : language === "mr"
                      ? "सहकारी नोंदींमध्ये शोध सुरू आहे..."
                      : language === "te"
                      ? "సహకార రికార్డులలో శోధన కొనసాగుతోంది..."
                      : "Retrieving grounded cooperative records..."}
                  </span>

                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">

                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>

                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-500 hover:text-red-700 font-bold px-2 py-0.5"
                >
                  ✕
                </button>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Quick Prompts */}
          <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/70 px-4 py-2 no-scrollbar">

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-saffron-500" />
              Suggestions:
            </span>

            {(quickPrompts[language] || quickPrompts.en).map(
              (prompt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleSendMessage(prompt)
                  }
                  disabled={isLoading}
                  className="whitespace-nowrap px-3 py-1 bg-white hover:bg-coop-50 border border-slate-200 hover:border-coop-300 rounded-full text-xs text-slate-700 transition-colors shrink-0 disabled:opacity-50"
                >
                  {prompt}
                </button>
              )
            )}

          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >

              {/* Mic */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl border transition-all ${
                  isRecording
                    ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
                title={
                  isRecording
                    ? "Stop Recording"
                    : "Voice Input (Speech-to-Text)"
                }
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) =>
                  setInputText(e.target.value)
                }
                placeholder={
                  isRecording
                    ? t.listening
                    : t.askQuestionPlaceholder
                }
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:bg-white transition-all disabled:opacity-60"
              />

              {/* Send */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-coop-700 hover:bg-coop-800 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-colors disabled:cursor-not-allowed shrink-0"
                title={t.send}
              >
                <Send className="w-5 h-5" />
              </button>

            </form>

            <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-400">

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-coop-600" />
                <span>Information service for cooperative members and farmers</span>
              </div>

              <span className="hidden sm:inline">
                Press Enter to send
              </span>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
