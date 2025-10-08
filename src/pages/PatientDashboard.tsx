import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Activity, Calendar, LogOut, Sparkles, Zap, Video, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import PatientProfile from '../components/PatientProfile';
import SymptomChecker from '../components/SymptomChecker';
import AppointmentBooking from '../components/AppointmentBooking';
import VoiceAssistant from '../components/VoiceAssistant';
import { storage } from '../utils/localStorage';
import { HealthRecord } from '../types';
import { createNavigationCommands, createPatientCommands } from '../utils/voiceCommands';

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    symptoms: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    notes: ''
  });

  const patient = storage.getCurrentPatient();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!patient) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    storage.clearUserData();
    navigate('/');
  };

  const handleAddRecord = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const record: HealthRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symptoms: newRecord.symptoms,
      vitals: {
        temperature: newRecord.temperature,
        bloodPressure: newRecord.bloodPressure,
        heartRate: newRecord.heartRate
      },
      notes: newRecord.notes
    };

    storage.addHealthRecord(record);
    setShowAddRecord(false);
    setNewRecord({
      symptoms: '',
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      notes: ''
    });
    setIsLoading(false);
    // Refresh the page to show new record
    window.location.reload();
  };

  const handleStartVideoCall = () => {
    const sessionId = `session-${Date.now()}`;
    const userId = patient.id;
    const doctorId = 'doctor-1';
    navigate(`/teleconsult?sessionId=${sessionId}&userId=${userId}&remoteUserId=${doctorId}&initiator=true&remoteName=Dr.%20Smith`);
  };

  const voiceCommands = useMemo(() => {
    const navigationCommands = createNavigationCommands(navigate, t);
    const patientCommands = createPatientCommands(setShowAddRecord, () => {}, t);
    return [...navigationCommands, ...patientCommands];
  }, [navigate, t]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-pattern">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">

        {/* Dashboard Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-cyan-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-black gradient-text text-glow">
              {t('patient.dashboard')}
            </h1>
            <Zap className="h-8 w-8 text-purple-400 ml-3" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your health records and connect with healthcare professionals
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartVideoCall}
              className="btn-primary btn-glow flex items-center space-x-3 text-lg px-8 py-4"
            >
              <Video className="h-6 w-6" />
              <span>Start Video Consultation</span>
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="btn-primary btn-glow flex items-center space-x-3 text-lg px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <MessageCircle className="h-6 w-6" />
              <span>AI Health Assistant</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Patient Profile */}
            <div id="patient-profile" className={`transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <PatientProfile patient={patient} />
            </div>

            {/* Health Records */}
            <div className={`card-modern transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="glass-card rounded-2xl p-3">
                    <FileText className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {t('patient.healthRecords')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="btn-primary btn-glow flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('patient.addRecord')}</span>
                </button>
              </div>

              <div className="space-y-8">
                {patient.records.length > 0 ? (
                  patient.records.map((record, index) => (
                    <div 
                      key={record.id} 
                      className={`glass-card rounded-3xl p-8 transition-all duration-300 card-glow`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-white text-xl">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-300 bg-white/10 px-4 py-2 rounded-full">#{record.id}</span>
                      </div>
                      <p className="text-gray-300 mb-6 text-lg">
                        <strong className="text-white">{t('common.symptoms')}:</strong> {record.symptoms}
                      </p>
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="glass-card rounded-2xl p-4 text-center">
                          <div className="text-sm text-cyan-400 font-medium mb-2">{t('patient.temperature')}</div>
                          <div className="text-2xl font-bold text-white">{record.vitals.temperature}</div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                          <div className="text-sm text-emerald-400 font-medium mb-2">{t('patient.bloodPressure')}</div>
                          <div className="text-2xl font-bold text-white">{record.vitals.bloodPressure}</div>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                          <div className="text-sm text-purple-400 font-medium mb-2">{t('patient.heartRate')}</div>
                          <div className="text-2xl font-bold text-white">{record.vitals.heartRate}</div>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="glass-card rounded-2xl p-6 mb-4">
                          <p className="text-gray-300">
                            <strong className="text-white">{t('common.notes')}:</strong> {record.notes}
                          </p>
                        </div>
                      )}
                      {record.prescription && (
                        <div className="glass-card rounded-2xl p-6 bg-cyan-500/10 border border-cyan-500/30">
                          <p className="text-cyan-300">
                            <strong className="text-cyan-200">{t('patient.prescription')}:</strong> {record.prescription}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="glass-card rounded-3xl p-12">
                      <FileText className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                      <p className="text-gray-400 text-xl">{t('patient.noRecords')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              <div id="symptom-checker" className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <SymptomChecker />
              </div>
              <div id="appointment-booking" className={`transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <AppointmentBooking />
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoiceAssistant commands={voiceCommands} />

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern w-full max-w-3xl max-h-[90vh] overflow-y-auto scale-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="glass-card rounded-2xl p-3">
                  <Plus className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">{t('patient.addRecord')}</h3>
              </div>
              <button
                onClick={() => setShowAddRecord(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="floating-label">
                <textarea
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                  className="input-modern"
                  rows={4}
                  placeholder=" "
                />
                <label className="text-gray-400">{t('common.symptoms')}</label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="floating-label">
                  <input
                    type="text"
                    value={newRecord.temperature}
                    onChange={(e) => setNewRecord({...newRecord, temperature: e.target.value})}
                    className="input-modern"
                    placeholder=" "
                  />
                  <label className="text-gray-400">{t('patient.temperature')}</label>
                </div>
                
                <div className="floating-label">
                  <input
                    type="text"
                    value={newRecord.bloodPressure}
                    onChange={(e) => setNewRecord({...newRecord, bloodPressure: e.target.value})}
                    className="input-modern"
                    placeholder=" "
                  />
                  <label className="text-gray-400">{t('patient.bloodPressure')}</label>
                </div>
                
                <div className="floating-label">
                  <input
                    type="text"
                    value={newRecord.heartRate}
                    onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                    className="input-modern"
                    placeholder=" "
                  />
                  <label className="text-gray-400">{t('patient.heartRate')}</label>
                </div>
              </div>
              
              <div className="floating-label">
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  className="input-modern"
                  rows={3}
                  placeholder=" "
                />
                <label className="text-gray-400">{t('common.notes')}</label>
              </div>
            </div>

            <div className="flex space-x-6 mt-12">
              <button
                onClick={handleAddRecord}
                disabled={isLoading}
                className="flex-1 btn-primary btn-glow flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>{t('common.save')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddRecord(false)}
                className="flex-1 btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;