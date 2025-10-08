import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface VoiceCommand {
  command: string;
  action: () => void;
  patterns: RegExp[];
}

interface UseVoiceAssistantProps {
  commands?: VoiceCommand[];
  enabled?: boolean;
  language?: string;
}

interface UseVoiceAssistantReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

export const useVoiceAssistant = ({
  commands = [],
  enabled = true,
  language = 'en-US',
}: UseVoiceAssistantProps = {}): UseVoiceAssistantReturn => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const getLanguageCode = useCallback((lang: string): string => {
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN',
      ne: 'ne-NP',
    };
    return langMap[lang] || 'en-US';
  }, []);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase();

    for (const cmd of commands) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(lowerText)) {
          cmd.action();
          return true;
        }
      }
    }
    return false;
  }, [commands]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(i18n.language);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [i18n.language, getLanguageCode]);

  const startListening = useCallback(() => {
    if (!isSupported || !enabled) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(language || i18n.language);
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsListening(false);
    }
  }, [isSupported, enabled, language, i18n.language, getLanguageCode, processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
  };
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
