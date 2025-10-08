import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Menu, X, User, UserCheck, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { storage } from '../utils/localStorage';

interface NavbarProps {
  showRoleButtons?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showRoleButtons = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userRole = storage.getUserRole();

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    storage.setUserRole(role);
    if (role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/doctor');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    storage.clearUserData();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="glass-card rounded-2xl p-3 group-hover:scale-110 transition-all duration-300">
              <Stethoscope className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold gradient-text text-glow">
              TelemediCare
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {showRoleButtons && (
              <>
                <button
                  onClick={() => handleRoleSelection('patient')}
                  className="nav-link flex items-center space-x-2 btn-glow"
                >
                  <User className="h-5 w-5" />
                  <span>{t('landing.iAmPatient')}</span>
                </button>
                <button
                  onClick={() => handleRoleSelection('doctor')}
                  className="nav-link flex items-center space-x-2 btn-glow"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>{t('landing.iAmDoctor')}</span>
                </button>
              </>
            )}
            
            {userRole && (
              <button
                onClick={handleLogout}
                className="nav-link flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}

            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden glass-card p-3 rounded-xl hover:scale-110 transition-all duration-300"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card rounded-2xl mt-4 p-6 slide-up">
            <div className="flex flex-col space-y-4">
              {showRoleButtons && (
                <>
                  <button
                    onClick={() => handleRoleSelection('patient')}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <User className="h-6 w-6 text-cyan-400" />
                    <span className="text-white font-medium">{t('landing.iAmPatient')}</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelection('doctor')}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <UserCheck className="h-6 w-6 text-emerald-400" />
                    <span className="text-white font-medium">{t('landing.iAmDoctor')}</span>
                  </button>
                </>
              )}
              
              {userRole && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <LogOut className="h-6 w-6 text-red-400" />
                  <span className="text-white font-medium">Logout</span>
                </button>
              )}

              <div className="pt-4 border-t border-white/10">
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
