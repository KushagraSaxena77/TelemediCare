import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, LogOut, Sparkles, Zap, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import { storage } from '../utils/localStorage';
import { dummyPatients, dummyAppointments, dummyDoctors } from '../data/dummyData';

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    storage.clearUserData();
    navigate('/');
  };

  const handleStartVideoCall = (patientId: string, patientName: string) => {
    const sessionId = `session-${Date.now()}`;
    const doctorId = 'doctor-1';
    navigate(`/teleconsult?sessionId=${sessionId}&userId=${doctorId}&remoteUserId=${patientId}&initiator=true&remoteName=${encodeURIComponent(patientName)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-pattern">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">

        {/* Dashboard Header */}
        <div className={`text-center mb-16 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-emerald-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-black gradient-text-secondary text-glow">
              {t('doctor.dashboard')}
            </h1>
            <Zap className="h-8 w-8 text-cyan-400 ml-3" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your patients and conduct teleconsultations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Patients */}
          <div className={`card-modern transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center space-x-4 mb-8">
              <div className="glass-card rounded-2xl p-3">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                {t('doctor.patients')}
              </h2>
            </div>

            <div className="space-y-8">
              {dummyPatients.map((patient, index) => (
                <div 
                  key={patient.id} 
                  className={`glass-card rounded-3xl p-8 transition-all duration-300 card-glow`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-white text-xl mb-2">{patient.name}</h3>
                      <p className="text-sm text-gray-300 mb-1">
                        {t('common.age')}: {patient.age} | {t('patient.lastCheckup')}: {patient.lastCheckup}
                      </p>
                      <p className="text-sm text-gray-400">
                        Records: {patient.records.length}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-primary text-sm px-4 py-2">
                        {t('doctor.viewRecord')}
                      </button>
                      <button
                        onClick={() => handleStartVideoCall(patient.id, patient.name)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
                      >
                        <Video className="h-4 w-4" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                  
                  {patient.records.length > 0 && (
                    <div className="glass-card rounded-2xl p-6">
                      <p className="text-sm mb-4 text-gray-300">
                        <strong className="text-white">{t('common.symptoms')}:</strong> {patient.records[0].symptoms}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card rounded-xl p-3 text-center">
                          <div className="text-xs text-blue-400 font-medium mb-1">Temp</div>
                          <div className="text-lg font-bold text-white">{patient.records[0].vitals.temperature}</div>
                        </div>
                        <div className="glass-card rounded-xl p-3 text-center">
                          <div className="text-xs text-emerald-400 font-medium mb-1">BP</div>
                          <div className="text-lg font-bold text-white">{patient.records[0].vitals.bloodPressure}</div>
                        </div>
                        <div className="glass-card rounded-xl p-3 text-center">
                          <div className="text-xs text-purple-400 font-medium mb-1">HR</div>
                          <div className="text-lg font-bold text-white">{patient.records[0].vitals.heartRate}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className={`card-modern transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center space-x-4 mb-8">
              <div className="glass-card rounded-2xl p-3">
                <Calendar className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                {t('doctor.appointments')}
              </h2>
            </div>

            <div className="space-y-8">
              {dummyAppointments.map((appointment, index) => {
                const patient = dummyPatients.find(p => p.id === appointment.patientId);
                return (
                  <div 
                    key={appointment.id} 
                    className={`glass-card rounded-3xl p-8 transition-all duration-300 card-glow`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-white text-xl mb-2">
                          {patient?.name}
                        </h3>
                        <p className="text-sm text-gray-300 mb-3">
                          {appointment.date} at {appointment.time}
                        </p>
                        <span className={`text-xs px-4 py-2 rounded-full font-medium ${
                          appointment.status === 'scheduled' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button className="btn-success text-sm px-6 py-3 flex-1">
                        {t('doctor.acceptAppointment')}
                      </button>
                      <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm px-6 py-3 rounded-2xl transition-all duration-300 flex-1">
                        {t('doctor.rescheduleAppointment')}
                      </button>
                      <button
                        onClick={() => handleStartVideoCall(appointment.patientId, patient?.name || 'Patient')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2"
                      >
                        <Video className="h-5 w-5" />
                        <span>Join Call</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Doctor Profile */}
        <div className={`mt-16 card-modern transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center space-x-8">
            <div className="glass-card rounded-3xl p-6">
              <Users className="h-16 w-16 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3 gradient-text-secondary">
                {dummyDoctors[0].name}
              </h2>
              <p className="text-gray-300 text-xl mb-4">{t('doctor.specialty')}: {dummyDoctors[0].specialty}</p>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-emerald-400 font-medium">Available for consultations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;