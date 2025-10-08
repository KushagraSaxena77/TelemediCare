export type IntentType = 'symptom_check' | 'book_appointment' | 'greeting' | 'unknown';

export interface Intent {
  type: IntentType;
  confidence: number;
  entities?: {
    symptoms?: string;
    specialty?: string;
  };
}

const SYMPTOM_KEYWORDS = [
  'pain', 'ache', 'hurt', 'fever', 'cough', 'cold', 'sick', 'dizzy', 'nausea',
  'headache', 'stomach', 'chest', 'throat', 'ear', 'eye', 'skin', 'rash',
  'breathing', 'tired', 'fatigue', 'weak', 'vomit', 'diarrhea', 'symptom'
];

const APPOINTMENT_KEYWORDS = [
  'book', 'appointment', 'schedule', 'consult', 'doctor', 'meet', 'visit',
  'see doctor', 'need doctor', 'talk to doctor'
];

const GREETING_KEYWORDS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'namaste', 'help', 'start'
];

export const detectIntent = (message: string): Intent => {
  const lowerMessage = message.toLowerCase();

  const symptomScore = SYMPTOM_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  ).length;

  const appointmentScore = APPOINTMENT_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  ).length;

  const greetingScore = GREETING_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  ).length;

  if (appointmentScore > 0 && appointmentScore >= symptomScore) {
    return {
      type: 'book_appointment',
      confidence: Math.min(appointmentScore * 0.3, 1)
    };
  }

  if (symptomScore > 0) {
    return {
      type: 'symptom_check',
      confidence: Math.min(symptomScore * 0.2, 1),
      entities: {
        symptoms: message
      }
    };
  }

  if (greetingScore > 0) {
    return {
      type: 'greeting',
      confidence: Math.min(greetingScore * 0.4, 1)
    };
  }

  return {
    type: 'unknown',
    confidence: 0
  };
};
