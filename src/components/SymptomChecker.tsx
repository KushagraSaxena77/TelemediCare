import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { checkSymptoms } from '../utils/symptomChecker';
import { SymptomResult } from '../types';

const SymptomChecker: React.FC = () => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (symptoms.trim()) {
      setLoading(true);
      try {
        const result = await checkSymptoms(symptoms);
        setResult(result);
      } catch (error) {
        console.error('Error checking symptoms:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      case 'low': return <CheckCircle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="card-modern card-glow">
      <div className="flex items-center space-x-4 mb-8">
        <div className="glass-card rounded-3xl p-4">
          <Search className="h-10 w-10 text-purple-400" />
        </div>
        <h3 className="text-3xl font-bold text-white gradient-text">
          {t('patient.symptomChecker')}
        </h3>
      </div>

      <div className="space-y-8">
        <div className="floating-label">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="input-modern"
            rows={4}
            placeholder=" "
          />
          <label className="text-gray-400">{t('patient.enterSymptoms')}</label>
        </div>

        <button
          onClick={handleCheck}
          disabled={!symptoms.trim() || loading}
          className="btn-primary btn-glow flex items-center space-x-3 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Search className="h-6 w-6" />
          )}
          <span className="text-lg">
            {loading ? 'Analyzing...' : t('patient.checkSymptoms')}
          </span>
        </button>

        {result && (
          <div className="glass-card rounded-3xl p-8 mt-8 scale-in">
            <div className={`flex items-center space-x-4 mb-6 px-6 py-4 rounded-2xl ${getSeverityColor(result.severity)}`}>
              {getSeverityIcon(result.severity)}
              <span className="font-bold text-xl">
                {result.condition}
              </span>
            </div>

            <div className="mb-8 glass-card rounded-2xl p-6">
              <h4 className="font-bold text-white mb-3 text-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Recommended Specialist:</span>
              </h4>
              <p className="text-cyan-300 text-xl font-semibold pl-4">
                {result.doctorSpecialty}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-xl">Recommendations:</h4>
              <ul className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-2 flex-shrink-0 pulse-glow"></div>
                    <span className="text-gray-300 text-lg">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;