import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { VoiceCommand } from '../types/voice';

interface VoiceAssistantProps {
  commands: VoiceCommand[];
  onCommandExecuted?: (command: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ commands, onCommandExecuted }) => {
  const { t } = useTranslation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
  } = useVoiceAssistant({
    commands,
    enabled: true,
  });

  useEffect(() => {
    if (transcript && !isListening) {
      const executed = commands.some(cmd =>
        cmd.patterns.some(pattern => pattern.test(transcript.toLowerCase()))
      );

      if (executed) {
        setFeedbackMessage(t('voice.feedback.commandRecognized'));
        speak(t('voice.feedback.commandRecognized'));
        onCommandExecuted?.(transcript);
      } else {
        setFeedbackMessage(t('voice.feedback.commandNotRecognized'));
        speak(t('voice.feedback.commandNotRecognized'));
      }

      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  }, [transcript, isListening, commands, speak, t, onCommandExecuted]);

  useEffect(() => {
    if (error) {
      setFeedbackMessage(t('common.error') + ': ' + error);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  }, [error, t]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/10">
        <p className="text-sm text-red-300">{t('voice.notSupported')}</p>
      </div>
    );
  }

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <button
        onClick={handleToggleListening}
        className={`fixed bottom-6 right-6 p-6 rounded-full transition-all duration-300 shadow-2xl z-50 ${
          isListening
            ? 'bg-gradient-to-br from-red-500 to-pink-600 animate-pulse scale-110'
            : 'bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-110'
        }`}
        title={isListening ? t('voice.stopListening') : t('voice.startListening')}
      >
        {isListening ? (
          <MicOff className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </button>

      {isListening && (
        <div className="fixed bottom-28 right-6 glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/10 z-50 min-w-[200px]">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Volume2 className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-50 animate-ping"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">{t('voice.listening')}</p>
              {transcript && (
                <p className="text-xs text-gray-300 mt-1 italic">"{transcript}"</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showFeedback && !isListening && (
        <div className="fixed bottom-28 right-6 glass-card rounded-2xl p-4 border border-cyan-500/30 bg-cyan-500/10 z-50 min-w-[250px] animate-slide-up">
          <p className="text-sm text-cyan-300">{feedbackMessage}</p>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
