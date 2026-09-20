"use client";

import Link from "next/link";
import { MessageSquare, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  en: {
    title: "Chat with Mitra",
    subtitle: "Get help in your language",
  },
  hi: {
    title: "मित्र से बात करें",
    subtitle: "अपनी भाषा में सहायता पाएं",
  },
  kn: {
    title: "ಮಿತ್ರರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    subtitle: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸಹಾಯ ಪಡೆಯಿರಿ",
  },
  mr: {
    title: "मित्राशी बोला",
    subtitle: "तुमच्या भाषेत मदत मिळवा",
  },
  te: {
    title: "మిత్రతో మాట్లాడండి",
    subtitle: "మీ భాషలో సహాయం పొందండి",
  },
};

export default function MitraChatWidget() {
  const { language } = useLanguage();

  const content =
    translations[language] || translations.en;

  return (
    <Link
      href="/chat"
      aria-label={content.title}
      className="
        fixed
        right-5
        bottom-[calc(var(--mobile-nav-height)+max(1rem,env(safe-area-inset-bottom)))]
        md:bottom-5
        z-40
        group
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          bg-white
          border
          border-slate-200
          rounded-xl
          shadow-lg
          px-4
          py-3
          min-w-0
          max-w-[calc(100vw-2.5rem)]
          sm:min-w-[235px]
          hover:shadow-xl
          hover:border-coop-300
          transition-shadow
          duration-200
        "
      >
        {/* Mitra icon */}
        <div
          className="
            w-11
            h-11
            shrink-0
            rounded-full
            bg-coop-700
            flex
            items-center
            justify-center
            text-white
            shadow-sm
          "
        >
          <MessageSquare className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="
              text-sm
              font-bold
              text-slate-900
              leading-tight
            "
          >
            {content.title}
          </div>

          <div
            className="
              text-xs
              text-slate-500
              mt-0.5
              leading-tight
            "
          >
            {content.subtitle}
          </div>
        </div>

        {/* Arrow */}
        <ChevronUp
          className="
            w-4
            h-4
            text-slate-400
            group-hover:text-coop-700
            transition-colors
          "
        />
      </div>
    </Link>
  );
}
