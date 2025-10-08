import { Patient, Doctor, Appointment } from '../types';

export const dummyPatients: Patient[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    age: 45,
    lastCheckup: '2024-01-10',
    records: [
      {
        id: '1',
        date: '2024-01-10',
        symptoms: 'Fever, headache, body aches',
        vitals: {
          temperature: '101.2°F',
          bloodPressure: '140/90',
          heartRate: '88 bpm'
        },
        notes: 'Viral fever symptoms, prescribed rest and medication',
        prescription: 'Paracetamol 650mg twice daily'
      }
    ]
  },
  {
    id: '2',
    name: 'Priya Sharma',
    age: 32,
    lastCheckup: '2024-01-08',
    records: [
      {
        id: '2',
        date: '2024-01-08',
        symptoms: 'Persistent cough, chest congestion',
        vitals: {
          temperature: '98.6°F',
          bloodPressure: '120/80',
          heartRate: '76 bpm'
        },
        notes: 'Respiratory tract infection, improving with medication',
        prescription: 'Cough syrup, Steam inhalation'
      }
    ]
  }
];

export const dummyDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Amit Singh',
    specialty: 'General Medicine',
    available: true
  },
  {
    id: '2',
    name: 'Dr. Meera Patel',
    specialty: 'Pediatrics',
    available: true
  },
  {
    id: '3',
    name: 'Dr. Suresh Reddy',
    specialty: 'Cardiology',
    available: false
  }
];

export const dummyAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'consultation'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    date: '2024-01-15',
    time: '2:00 PM',
    status: 'scheduled',
    type: 'follow-up'
  }
];