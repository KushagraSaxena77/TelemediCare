import { VoiceCommand } from '../types/voice';

export const createNavigationCommands = (
  navigate: (path: string) => void,
  t: (key: string) => string
): VoiceCommand[] => [
  {
    command: 'navigate_home',
    action: () => navigate('/'),
    patterns: [
      /go\s+(to\s+)?home/i,
      /take\s+me\s+home/i,
      /home\s+page/i,
      /घर\s+जाओ/i,
      /होम\s+पर\s+जाओ/i,
    ],
  },
  {
    command: 'navigate_dashboard',
    action: () => navigate('/patient'),
    patterns: [
      /go\s+(to\s+)?dashboard/i,
      /show\s+dashboard/i,
      /open\s+dashboard/i,
      /डैशबोर्ड\s+खोलो/i,
      /डैशबोर्ड\s+दिखाओ/i,
      /डैशबोर्ड\s+पर\s+जाओ/i,
    ],
  },
  {
    command: 'start_teleconsult',
    action: () => {
      const sessionId = `session-${Date.now()}`;
      const userId = 'patient-1';
      const doctorId = 'doctor-1';
      navigate(`/teleconsult?sessionId=${sessionId}&userId=${userId}&remoteUserId=${doctorId}&initiator=true&remoteName=Dr.%20Smith`);
    },
    patterns: [
      /start\s+(video\s+)?(call|consultation|consult)/i,
      /begin\s+(video\s+)?(call|consultation)/i,
      /video\s+(call|chat)/i,
      /वीडियो\s+कॉल\s+शुरू\s+करो/i,
      /कॉल\s+शुरू\s+करो/i,
      /डॉक्टर\s+से\s+बात\s+करो/i,
    ],
  },
];

export const createPatientCommands = (
  setShowAddRecord: (show: boolean) => void,
  setActiveTab: (tab: string) => void,
  t: (key: string) => string
): VoiceCommand[] => [
  {
    command: 'book_appointment',
    action: () => {
      const appointmentSection = document.getElementById('appointment-booking');
      if (appointmentSection) {
        appointmentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    patterns: [
      /book\s+(an\s+)?appointment/i,
      /schedule\s+(an\s+)?appointment/i,
      /make\s+(an\s+)?appointment/i,
      /अपॉइंटमेंट\s+बुक\s+करो/i,
      /अपॉइंटमेंट\s+लो/i,
    ],
  },
  {
    command: 'check_symptoms',
    action: () => {
      const symptomSection = document.getElementById('symptom-checker');
      if (symptomSection) {
        symptomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    patterns: [
      /check\s+symptoms?/i,
      /symptom\s+checker/i,
      /analyze\s+symptoms?/i,
      /लक्षण\s+जांचो/i,
      /लक्षण\s+चेक\s+करो/i,
    ],
  },
  {
    command: 'add_record',
    action: () => setShowAddRecord(true),
    patterns: [
      /add\s+(health\s+)?record/i,
      /new\s+record/i,
      /create\s+record/i,
      /रिकॉर्ड\s+जोड़ो/i,
      /नया\s+रिकॉर्ड/i,
    ],
  },
  {
    command: 'view_profile',
    action: () => {
      const profileSection = document.getElementById('patient-profile');
      if (profileSection) {
        profileSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    patterns: [
      /show\s+(my\s+)?profile/i,
      /view\s+profile/i,
      /open\s+profile/i,
      /प्रोफाइल\s+दिखाओ/i,
      /मेरा\s+प्रोफाइल/i,
    ],
  },
];

export const createAppointmentCommands = (
  slots: Array<{ date: string; time: string; doctor: string }>,
  onSelectSlot: (slot: string) => void,
  onBookAppointment: () => void,
  t: (key: string) => string
): VoiceCommand[] => {
  const slotCommands: VoiceCommand[] = slots.map((slot, index) => ({
    command: `select_slot_${index}`,
    action: () => onSelectSlot(`${slot.date}-${slot.time}`),
    patterns: [
      new RegExp(`(select|choose|book|pick)\\s+(slot\\s+)?${index + 1}`, 'i'),
      new RegExp(`${slot.time}`, 'i'),
      new RegExp(`${slot.date}`, 'i'),
    ],
  }));

  return [
    ...slotCommands,
    {
      command: 'confirm_booking',
      action: () => onBookAppointment(),
      patterns: [
        /confirm\s+(booking|appointment)/i,
        /book\s+it/i,
        /yes,?\s+(book|confirm)/i,
        /बुक\s+करो/i,
        /पक्का\s+करो/i,
        /हां,?\s+बुक\s+करो/i,
      ],
    },
  ];
};
