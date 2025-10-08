import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

const ChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAppointmentPrompt, setShowAppointmentPrompt] = useState(false);

  const handleBookAppointment = () => {
    setShowAppointmentPrompt(true);
    setTimeout(() => {
      navigate('/patient');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">AI Health Assistant</h1>
            <p className="text-gray-400">Describe your symptoms or book an appointment using voice or text</p>
          </div>

          <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800" style={{ height: '600px' }}>
            <Chatbot onBookAppointment={handleBookAppointment} />
          </div>

          {showAppointmentPrompt && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500 rounded-xl text-center">
              <p className="text-white">Redirecting you to appointment booking...</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="text-white font-semibold mb-2">Tips for using the chatbot:</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Describe your symptoms in detail for better analysis</li>
              <li>• Use voice input by clicking the microphone icon</li>
              <li>• Enable speech output to hear responses</li>
              <li>• Say "book appointment" to schedule a consultation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
