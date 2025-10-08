import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, Loader2, X } from 'lucide-react';
import { ChatMessage } from '../types/chatbot';
import { detectIntent } from '../utils/chatbotIntents';
import { checkSymptoms } from '../utils/symptomChecker';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ChatbotProps {
  onClose?: () => void;
  onBookAppointment?: (specialty?: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, onBookAppointment }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI health assistant. You can tell me your symptoms or ask to book an appointment. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported: speechSupported } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  useEffect(() => {
    if (transcript && !isListening) {
      setInputMessage(prev => prev + ' ' + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string, metadata?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      metadata
    };
    setMessages(prev => [...prev, newMessage]);

    if (role === 'assistant' && isSpeechEnabled && ttsSupported) {
      speak(content);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);

    setIsProcessing(true);

    try {
      const intent = detectIntent(userMessage);

      switch (intent.type) {
        case 'greeting':
          addMessage('assistant', 'Hello! I\'m here to help. You can describe your symptoms for health guidance, or ask me to book an appointment with a doctor.');
          break;

        case 'symptom_check':
          addMessage('assistant', 'Let me analyze your symptoms...');
          try {
            const symptomResult = await checkSymptoms(userMessage);
            const response = `Based on your symptoms, it appears you might have ${symptomResult.condition}. The severity level is ${symptomResult.severity}.\n\nI recommend consulting a ${symptomResult.doctorSpecialty}.\n\nHere are some recommendations:\n${symptomResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}\n\nWould you like me to help you book an appointment?`;
            addMessage('assistant', response, { symptomResult });
          } catch (error) {
            addMessage('assistant', 'I apologize, but I encountered an issue analyzing your symptoms. Please try again or consult with a healthcare professional directly.');
          }
          break;

        case 'book_appointment':
          addMessage('assistant', 'I\'d be happy to help you book an appointment. Let me direct you to the appointment booking system.');
          if (onBookAppointment) {
            setTimeout(() => onBookAppointment(), 1500);
          }
          break;

        case 'unknown':
          addMessage('assistant', 'I\'m here to help with:\n1. Analyzing symptoms - Just describe what you\'re experiencing\n2. Booking appointments - Say "book appointment" or "I need to see a doctor"\n\nHow can I assist you?');
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      stopSpeaking();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <MessageCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Health Assistant</h2>
            <p className="text-xs text-gray-400">Voice & text enabled</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {ttsSupported && (
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-full transition-all ${
                isSpeechEnabled
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
              }`}
              title={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
            >
              {isSpeechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-700/50 text-gray-400 hover:bg-slate-700 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-100 border border-slate-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-60">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
              className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              disabled={isProcessing}
            />
            {isListening && (
              <div className="absolute right-3 top-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {speechSupported && (
              <button
                onClick={toggleVoiceInput}
                disabled={isProcessing}
                className={`p-3 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        {!speechSupported && (
          <p className="text-xs text-gray-500 mt-2">Voice input not supported in this browser</p>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
