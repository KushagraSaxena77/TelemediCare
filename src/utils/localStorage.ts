import { HealthRecord, Patient } from '../types';

const STORAGE_KEYS = {
  LANGUAGE: 'selectedLanguage',
  PATIENTS: 'patients',
  CURRENT_PATIENT: 'currentPatient',
  USER_ROLE: 'userRole',
};

export const storage = {
  setLanguage: (language: string) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  getLanguage: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  },

  setUserRole: (role: 'patient' | 'doctor') => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  },

  getUserRole: (): 'patient' | 'doctor' | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'patient' | 'doctor' | null;
  },

  setCurrentPatient: (patient: Patient) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(patient));
  },

  getCurrentPatient: (): Patient | null => {
    const patient = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);
    return patient ? JSON.parse(patient) : null;
  },

  addHealthRecord: (record: HealthRecord) => {
    const patient = storage.getCurrentPatient();
    if (patient) {
      patient.records.push(record);
      storage.setCurrentPatient(patient);
    }
  },

  clearUserData: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PATIENT);
  },
};