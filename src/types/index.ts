export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  lastCheckup: string;
  records: HealthRecord[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}

export interface HealthRecord {
  id: string;
  date: string;
  symptoms: string;
  vitals: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
  };
  notes: string;
  prescription?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'consultation' | 'follow-up';
}

export interface SymptomResult {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  doctorSpecialty: string;
}

export interface ConsultationSession {
  id: string;
  patient_id: string;
  doctor_id: string;
  session_type: 'video' | 'audio-only' | 'chat';
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  connection_quality: 'excellent' | 'good' | 'poor';
  recording_enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SignalingMessage {
  id: string;
  session_id: string;
  sender_id: string;
  receiver_id: string;
  message_type: 'offer' | 'answer' | 'ice-candidate' | 'renegotiate';
  payload: Record<string, any>;
  created_at: string;
}

export interface CallQualityMetric {
  id: string;
  session_id: string;
  user_id: string;
  bandwidth_kbps: number;
  packet_loss: number;
  latency_ms: number;
  video_resolution: string;
  frame_rate: number;
  recorded_at: string;
}