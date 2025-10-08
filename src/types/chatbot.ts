export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    symptomResult?: any;
    appointmentData?: any;
  };
}

export interface ChatbotState {
  messages: ChatMessage[];
  isProcessing: boolean;
  awaitingAppointmentDetails: boolean;
}
