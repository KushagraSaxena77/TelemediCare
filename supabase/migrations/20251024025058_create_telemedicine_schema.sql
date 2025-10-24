/*
  # Telemedicine Platform Database Schema

  ## Overview
  Creates a comprehensive database schema for a multilingual telemedicine platform with video consultations, 
  appointment booking, patient records, and chatbot interactions.

  ## 1. New Tables

  ### users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `role` (text) - User role: 'patient' or 'doctor'
  - `preferred_language` (text) - Language preference code
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### patients
  - `id` (uuid, primary key, FK to users) - Patient ID
  - `date_of_birth` (date) - Patient's date of birth
  - `gender` (text) - Patient gender
  - `blood_group` (text) - Blood group type
  - `address` (text) - Residential address
  - `emergency_contact_name` (text) - Emergency contact person
  - `emergency_contact_phone` (text) - Emergency contact number
  - `medical_history` (text) - General medical history notes
  - `allergies` (text) - Known allergies
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### doctors
  - `id` (uuid, primary key, FK to users) - Doctor ID
  - `specialty` (text) - Medical specialty
  - `qualification` (text) - Educational qualifications
  - `license_number` (text, unique) - Medical license number
  - `experience_years` (integer) - Years of experience
  - `consultation_fee` (numeric) - Consultation fee amount
  - `available` (boolean) - Current availability status
  - `bio` (text) - Professional biography
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### health_records
  - `id` (uuid, primary key) - Record identifier
  - `patient_id` (uuid, FK to patients) - Patient reference
  - `doctor_id` (uuid, FK to doctors) - Doctor who created record
  - `appointment_id` (uuid, FK to appointments) - Associated appointment
  - `date` (date) - Record date
  - `symptoms` (text) - Reported symptoms
  - `diagnosis` (text) - Medical diagnosis
  - `temperature` (text) - Body temperature
  - `blood_pressure` (text) - Blood pressure reading
  - `heart_rate` (text) - Heart rate measurement
  - `notes` (text) - Clinical notes
  - `prescription` (text) - Prescribed medications
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### appointments
  - `id` (uuid, primary key) - Appointment identifier
  - `patient_id` (uuid, FK to patients) - Patient reference
  - `doctor_id` (uuid, FK to doctors) - Doctor reference
  - `appointment_date` (date) - Appointment date
  - `appointment_time` (time) - Appointment time
  - `status` (text) - Status: 'scheduled', 'completed', 'cancelled', 'no-show'
  - `type` (text) - Type: 'consultation', 'follow-up'
  - `reason` (text) - Reason for consultation
  - `notes` (text) - Appointment notes
  - `created_at` (timestamptz) - Booking timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### consultation_sessions
  - `id` (uuid, primary key) - Session identifier
  - `appointment_id` (uuid, FK to appointments) - Associated appointment
  - `patient_id` (uuid, FK to patients) - Patient reference
  - `doctor_id` (uuid, FK to doctors) - Doctor reference
  - `session_type` (text) - Type: 'video', 'audio-only', 'chat'
  - `status` (text) - Status: 'waiting', 'active', 'ended', 'cancelled'
  - `started_at` (timestamptz) - Session start time
  - `ended_at` (timestamptz) - Session end time
  - `connection_quality` (text) - Quality: 'excellent', 'good', 'poor'
  - `recording_enabled` (boolean) - Recording flag
  - `metadata` (jsonb) - Additional session data
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### signaling_messages
  - `id` (uuid, primary key) - Message identifier
  - `session_id` (uuid, FK to consultation_sessions) - Session reference
  - `sender_id` (uuid, FK to users) - Message sender
  - `receiver_id` (uuid, FK to users) - Message receiver
  - `message_type` (text) - Type: 'offer', 'answer', 'ice-candidate', 'renegotiate'
  - `payload` (jsonb) - WebRTC signaling payload
  - `created_at` (timestamptz) - Message timestamp

  ### call_quality_metrics
  - `id` (uuid, primary key) - Metric identifier
  - `session_id` (uuid, FK to consultation_sessions) - Session reference
  - `user_id` (uuid, FK to users) - User reference
  - `bandwidth_kbps` (numeric) - Bandwidth in Kbps
  - `packet_loss` (numeric) - Packet loss percentage
  - `latency_ms` (numeric) - Latency in milliseconds
  - `video_resolution` (text) - Video resolution
  - `frame_rate` (numeric) - Video frame rate
  - `recorded_at` (timestamptz) - Metric timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### chatbot_conversations
  - `id` (uuid, primary key) - Conversation identifier
  - `user_id` (uuid, FK to users) - User reference
  - `started_at` (timestamptz) - Conversation start time
  - `ended_at` (timestamptz) - Conversation end time
  - `language` (text) - Conversation language
  - `metadata` (jsonb) - Additional conversation data
  - `created_at` (timestamptz) - Record creation timestamp

  ### chatbot_messages
  - `id` (uuid, primary key) - Message identifier
  - `conversation_id` (uuid, FK to chatbot_conversations) - Conversation reference
  - `role` (text) - Role: 'user' or 'assistant'
  - `content` (text) - Message content
  - `metadata` (jsonb) - Additional message data (symptoms, appointments)
  - `created_at` (timestamptz) - Message timestamp

  ## 2. Security
  
  - Enable RLS on all tables
  - Patients can only access their own data
  - Doctors can access their patients' data and their own appointments
  - Authenticated users can manage their own profiles
  - Consultation session participants can access session data
  - Chatbot conversations are private to the user

  ## 3. Indexes
  
  - Created indexes on foreign keys for query performance
  - Added indexes on frequently queried fields (status, dates, availability)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('patient', 'doctor')),
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history text,
  allergies text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialty text NOT NULL,
  qualification text,
  license_number text UNIQUE NOT NULL,
  experience_years integer DEFAULT 0,
  consultation_fee numeric(10, 2) DEFAULT 0,
  available boolean DEFAULT true,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  type text DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow-up')),
  reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  date date DEFAULT CURRENT_DATE,
  symptoms text,
  diagnosis text,
  temperature text,
  blood_pressure text,
  heart_rate text,
  notes text,
  prescription text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultation_sessions table
CREATE TABLE IF NOT EXISTS consultation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  session_type text DEFAULT 'video' CHECK (session_type IN ('video', 'audio-only', 'chat')),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  connection_quality text DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'poor')),
  recording_enabled boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create signaling_messages table
CREATE TABLE IF NOT EXISTS signaling_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('offer', 'answer', 'ice-candidate', 'renegotiate')),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create call_quality_metrics table
CREATE TABLE IF NOT EXISTS call_quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bandwidth_kbps numeric(10, 2),
  packet_loss numeric(5, 2),
  latency_ms numeric(10, 2),
  video_resolution text,
  frame_rate numeric(5, 2),
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  language text DEFAULT 'en',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_health_records_patient_id ON health_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_records_doctor_id ON health_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);

CREATE INDEX IF NOT EXISTS idx_consultation_sessions_patient_id ON consultation_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_doctor_id ON consultation_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_status ON consultation_sessions(status);

CREATE INDEX IF NOT EXISTS idx_signaling_messages_session_id ON signaling_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_signaling_messages_created_at ON signaling_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_call_quality_metrics_session_id ON call_quality_metrics(session_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(available);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signaling_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for patients table
CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors can view their patients' data"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = patients.id
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can insert own data"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for doctors table
CREATE POLICY "Anyone can view available doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Doctors can view own profile"
  ON doctors FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors can update own data"
  ON doctors FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can insert own data"
  ON doctors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for appointments table
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- RLS Policies for health_records table
CREATE POLICY "Patients can view own health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their patients' health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create health records for their patients"
  ON health_records FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = health_records.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update health records they created"
  ON health_records FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- RLS Policies for consultation_sessions table
CREATE POLICY "Patients can view own consultation sessions"
  ON consultation_sessions FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their consultation sessions"
  ON consultation_sessions FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Session participants can create sessions"
  ON consultation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Session participants can update sessions"
  ON consultation_sessions FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid())
  WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

-- RLS Policies for signaling_messages table
CREATE POLICY "Users can view messages they sent or received"
  ON signaling_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send signaling messages"
  ON signaling_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- RLS Policies for call_quality_metrics table
CREATE POLICY "Users can view own call quality metrics"
  ON call_quality_metrics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Session participants can view session metrics"
  ON call_quality_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultation_sessions
      WHERE consultation_sessions.id = call_quality_metrics.session_id
      AND (consultation_sessions.patient_id = auth.uid() OR consultation_sessions.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own call quality metrics"
  ON call_quality_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for chatbot_conversations table
CREATE POLICY "Users can view own chatbot conversations"
  ON chatbot_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own chatbot conversations"
  ON chatbot_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chatbot conversations"
  ON chatbot_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for chatbot_messages table
CREATE POLICY "Users can view messages from own conversations"
  ON chatbot_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chatbot_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_sessions_updated_at BEFORE UPDATE ON consultation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();