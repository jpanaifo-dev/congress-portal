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

export interface RegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  participantType: 'Pregrado' | 'Postgrado' | 'Público General';
  researchArea: string;
}
