import os
import uuid
import asyncio
from typing import Optional
from backend.app.config import settings
from backend.app.core.logging_config import logger

# Voice mappings for Microsoft Edge TTS
VOICE_MAP = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "kn": "kn-IN-SapnaNeural",
    "mr": "mr-IN-AarohiNeural",
    "te": "te-IN-ShrutiNeural"
}

class VoiceService:
    def __init__(self):
        self.audio_dir = settings.AUDIO_STORAGE_DIR
        os.makedirs(self.audio_dir, exist_ok=True)

    async def generate_tts(self, text: str, language: str = "en") -> Optional[str]:
        """
        Generate TTS audio using edge-tts.
        Returns the filename of the saved audio file in audio_dir.
        Gracefully handles errors so TTS failure never breaks text response.
        """
        if not text or not text.strip():
            return None

        if not settings.ENABLE_EDGE_TTS:
            logger.info("Edge TTS is disabled; returning text-only response.")
            return None

        # Truncate text for TTS to first 500 characters to keep audio response snappy
        clean_text = text.replace("*", "").replace("#", "").strip()[:500]

        voice = VOICE_MAP.get(language, "en-IN-NeerjaNeural")
        filename = f"tts_{uuid.uuid4().hex[:12]}.mp3"
        output_path = os.path.join(self.audio_dir, filename)

        try:
            import edge_tts
            communicate = edge_tts.Communicate(clean_text, voice)
            await communicate.save(output_path)
            if not os.path.isfile(output_path) or os.path.getsize(output_path) == 0:
                raise RuntimeError("Edge TTS did not create an audio file")
            logger.info(f"Generated TTS audio: {filename} for lang {language}")
            return filename
        except Exception as e:
            logger.warning(f"Edge TTS generation failed: {e}. Graceful degradation active.")
            return None

    def transcribe_audio(self, file_bytes: bytes, filename: str, language: Optional[str] = None) -> dict:
        """
        Transcribe uploaded audio file.
        Uses whisper if available, or returns recognized text / fallback.
        """
        try:
            # We can save temporarily
            temp_path = os.path.join(self.audio_dir, f"stt_{uuid.uuid4().hex[:8]}_{filename}")
            with open(temp_path, "wb") as f:
                f.write(file_bytes)

            text_result = ""
            confidence = 0.90
            detected_lang = language or "en"

            # Attempt whisper if available
            try:
                import whisper
                model = whisper.load_model("base")
                result = model.transcribe(temp_path, language=language)
                text_result = result.get("text", "").strip()
                detected_lang = result.get("language", detected_lang)
            except Exception as whisper_err:
                logger.warning(
                    "Whisper transcription is unavailable: %s",
                    whisper_err,
                )
                confidence = 0.0

            # Clean up temp file
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass

            return {
                "text": text_result,
                "detected_language": detected_lang,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Audio transcription error: {e}")
            return {
                "text": "",
                "detected_language": language or "en",
                "confidence": 0.0
            }

voice_service = VoiceService()
