import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User } from 'lucide-react';
import { dummyDoctors } from '../data/dummyData';
import VoiceAssistant from './VoiceAssistant';
import { createAppointmentCommands } from '../utils/voiceCommands';

const AppointmentBooking: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const availableSlots = [
    { date: '2024-01-15', time: '10:00 AM', doctor: 'Dr. Amit Singh' },
    { date: '2024-01-15', time: '2:00 PM', doctor: 'Dr. Meera Patel' },
    { date: '2024-01-16', time: '11:00 AM', doctor: 'Dr. Amit Singh' },
  ];

  const handleBooking = () => {
    if (selectedSlot) {
      alert(t('common.success') + '!');
    }
  };

  const voiceCommands = useMemo(() => {
    return createAppointmentCommands(availableSlots, setSelectedSlot, handleBooking, t);
  }, [availableSlots, t]);

  return (
    <div className="card-modern card-glow">
      <div className="flex items-center space-x-4 mb-8">
        <div className="glass-card rounded-3xl p-4">
          <Calendar className="h-10 w-10 text-emerald-400" />
        </div>
        <h3 className="text-3xl font-bold text-white gradient-text-secondary">
          {t('patient.bookAppointment')}
        </h3>
      </div>

      <div className="space-y-6">
        {availableSlots.map((slot, index) => (
          <div
            key={index}
            className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              selectedSlot === `${slot.date}-${slot.time}` 
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-2xl' 
                : 'border-white/10 hover:border-emerald-400/30'
            }`}
            onClick={() => setSelectedSlot(`${slot.date}-${slot.time}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  <span className="font-bold text-white text-lg">{slot.date}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-cyan-400" />
                  <span className="font-semibold text-gray-300 text-lg">{slot.time}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 font-medium">{slot.doctor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleBooking}
        disabled={!selectedSlot}
        className="w-full mt-8 btn-success btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('patient.bookAppointment')}
      </button>
    </div>
  );
};

export default AppointmentBooking;