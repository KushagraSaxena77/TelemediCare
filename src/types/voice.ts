export interface VoiceCommand {
  command: string;
  action: () => void;
  patterns: RegExp[];
}

export type VoiceCommandType =
  | 'navigate_home'
  | 'navigate_dashboard'
  | 'navigate_appointments'
  | 'book_appointment'
  | 'check_symptoms'
  | 'view_profile'
  | 'start_call'
  | 'end_call'
  | 'help';

export interface VoiceCommandConfig {
  type: VoiceCommandType;
  patterns: string[];
  action: () => void;
}
