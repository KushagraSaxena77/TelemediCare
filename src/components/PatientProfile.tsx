import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Calendar } from 'lucide-react';
import { Patient } from '../types';

interface PatientProfileProps {
  patient: Patient;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const { t } = useTranslation();

  return (
    <div className="card-modern card-glow">
      <div className="flex items-center space-x-8">
        <div className="glass-card rounded-3xl p-6 transition-all duration-300">
          <User className="h-16 w-16 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-3 gradient-text">{patient.name}</h2>
          <p className="text-gray-300 text-xl mb-4">{t('common.age')}: {patient.age}</p>
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-cyan-400" />
            <span className="text-gray-300 text-lg">
              {t('patient.lastCheckup')}: {new Date(patient.lastCheckup).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;