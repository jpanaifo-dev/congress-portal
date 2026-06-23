export interface Speaker {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface ScheduleActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  speakerId?: string; // Links to Speaker
  type: 'keynote' | 'panel' | 'research' | 'workshop' | 'break' | 'ceremony';
  track?: string;
}

export interface DaySchedule {
  day: number;
  dateString: string;
  activities: ScheduleActivity[];
}

export interface ScientificArea {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon identifier
}

export interface Fee {
  id: string;
  category: 'Pregrado' | 'Postgrado' | 'Público General';
  price: number;
  benefits: string[];
  popular: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type DbDocumentType = 'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE';

export interface RegistrationInput {
  firstNames: string;
  lastNames: string;
  email: string;
  phone: string;
  docType: DbDocumentType;
  documentNumber: string;
  institution: string;
  participantType: 'Pregrado' | 'Postgrado' | 'Público General';
  researchArea: string;
}

// ==========================================
// Nhost/Database Schema Types & Enums
// ==========================================

export type DbUserRole = 'admin' | 'evaluator' | 'participant';
export type DbParticipationType = 'pregrado' | 'postgrado' | 'publico_general';
export type DbResearchArea = 'ciencias_salud' | 'ciencias_naturales' | 'ingenierias' | 'ciencias_sociales';
export type DbSessionType = 'ceremony' | 'keynote' | 'panel' | 'research' | 'break';
export type DbPaymentStatus = 'pending' | 'verified' | 'rejected';

export interface DbProfile {
  id: string; // UUID coinciding with auth.users id
  email: string;
  first_names: string;
  last_names: string;
  doc_type: DbDocumentType;
  doc_number: string;
  phone: string | null;
  institution: string | null;
  role: DbUserRole;
  created_at?: string;
}

export interface DbEvent {
  id: string; // UUID
  name: string;
  description: string | null;
  created_at?: string;
  location?: string | null;
  modality?: string | null;
}

export interface DbEdition {
  id: string; // UUID
  event_id: string; // UUID
  slug: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  location?: string | null;
  modality?: string | null;
}

export interface DbSpeaker {
  id: string; // UUID
  full_name: string;
  specialty: string;
  bio: string | null;
  photo_url: string | null;
  institution: string | null;
  created_at?: string;
}

export interface DbSession {
  id: string; // UUID
  edition_id: string; // UUID
  title: string;
  description: string | null;
  type: DbSessionType;
  start_time: string;
  end_time: string;
  location: string | null;
  created_at?: string;
}

export interface DbSessionSpeaker {
  session_id: string; // UUID
  speaker_id: string; // UUID
}

export interface DbRegistration {
  id: string; // UUID
  profile_id: string; // UUID
  edition_id: string; // UUID
  participation_type: DbParticipationType;
  research_area: DbResearchArea | null;
  payment_status: DbPaymentStatus;
  voucher_url: string | null;
  verified_by: string | null; // UUID referencing profiles(id)
  verified_at: string | null;
  certificate_issued: boolean;
  created_at?: string;
}
