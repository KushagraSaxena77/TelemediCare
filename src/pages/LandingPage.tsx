import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, UserCheck, Shield, Globe, Heart, Sparkles, Zap, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { storage } from '../utils/localStorage';
import { dummyPatients } from '../data/dummyData';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    storage.setUserRole(role);
    if (role === 'patient') {
      // Set a default patient for demo
      storage.setCurrentPatient(dummyPatients[0]);
      navigate('/patient');
    } else {
      navigate('/doctor');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-pattern">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <Navbar showRoleButtons={true} />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center">
          <div className={`mb-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="h-12 w-12 text-cyan-400 animate-pulse mr-4" />
              <h1 className="text-6xl md:text-8xl font-black gradient-text text-glow leading-tight">
                {t('landing.title')}
              </h1>
              <Zap className="h-12 w-12 text-purple-400 animate-pulse ml-4" />
            </div>
            <p className="text-xl md:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className={`card-modern p-12 md:p-16 mb-24 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-12">
              <Star className="h-8 w-8 text-cyan-400 mr-3" />
              <h2 className="text-4xl font-bold text-white">
                {t('landing.selectRole')}
              </h2>
              <Star className="h-8 w-8 text-purple-400 ml-3" />
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Patient Button */}
              <button
                onClick={() => handleRoleSelection('patient')}
                className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-600/20 hover:from-cyan-400/30 hover:via-blue-400/30 hover:to-purple-500/30 text-white rounded-3xl p-12 transition-all duration-300 hover:shadow-xl border border-cyan-500/30 hover:border-cyan-400/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center space-y-8">
                  <div className="glass-card rounded-3xl p-8 transition-all duration-300">
                    <User className="h-20 w-20 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 gradient-text-secondary">
                      {t('landing.iAmPatient')}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Access your health records, book appointments, and consult with doctors
                    </p>
                  </div>
                </div>
              </button>

              {/* Doctor Button */}
              <button
                onClick={() => handleRoleSelection('doctor')}
                className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-400/30 hover:via-teal-400/30 hover:to-cyan-400/30 text-white rounded-3xl p-12 transition-all duration-300 hover:shadow-xl border border-emerald-500/30 hover:border-emerald-400/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center space-y-8">
                  <div className="glass-card rounded-3xl p-8 transition-all duration-300">
                    <UserCheck className="h-20 w-20 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 gradient-text-secondary">
                      {t('landing.iAmDoctor')}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Manage patients, view records, and conduct teleconsultations
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className={`grid md:grid-cols-3 gap-12 max-w-6xl mx-auto transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="card-modern text-center group card-glow transition-all duration-300">
              <div className="glass-card rounded-3xl p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center transition-all duration-300">
                <Globe className="h-12 w-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 gradient-text">22 Languages</h3>
              <p className="text-gray-300 leading-relaxed text-lg">Healthcare in your native language with seamless translation</p>
            </div>
            <div className="card-modern text-center group card-glow transition-all duration-300">
              <div className="glass-card rounded-3xl p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center transition-all duration-300">
                <Shield className="h-12 w-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 gradient-text-secondary">Digital Records</h3>
              <p className="text-gray-300 leading-relaxed text-lg">Secure offline-first health records with end-to-end encryption</p>
            </div>
            <div className="card-modern text-center group card-glow transition-all duration-300">
              <div className="glass-card rounded-3xl p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center transition-all duration-300">
                <Heart className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 gradient-text">Teleconsultation</h3>
              <p className="text-gray-300 leading-relaxed text-lg">Connect with doctors remotely through high-quality video calls</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`mt-32 grid md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-500 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
              <div className="text-gray-400">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-secondary mb-2">500+</div>
              <div className="text-gray-400">Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-secondary mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;