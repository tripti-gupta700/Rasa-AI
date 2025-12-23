export type View = 'chat' | 'tip' | 'wisdom' | 'consult' | 'settings' | 'vision';

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface EmergencyPayload {
    type: 'EMERGENCY_ALERT';
    title: string;
    message: string;
    actions: { text: string; url: string }[];
}


export interface Message {
  id: number;
  text?: string;
  recipes?: Recipe[];
  sender: 'user' | 'ai';
  lang?: string; // For storing the detected language of the message for TTS
  emergencyPayload?: EmergencyPayload;
}

export interface DailyTipData {
    tip: string;
    images: {
        ingredient: string;
        base64: string;
    }[];
}


export interface Language {
  code: string;
  name:string;
  localName: string;
}

export interface Consultation {
    id: string;
    patientId: string;
    patientName: string;
    date: string; // ISO string date
    notes: string;
    status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface Billing {
    id: string;
    consultationId: string;
    patientId: string;
    patientName: string;
    amount: number;
    date: string; // ISO string date
    status: 'Paid' | 'Pending';
}

export interface UserProfile {
    age?: string;
    medicalHistory?: string;
    foodAllergies?: string;
    height?: string;
    weight?: string;
    bloodType?: string;
    consultantId?: string;
}

export interface ConsultantProfile {
    qualifications: string;
    specialization: string;
    consultationFee: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'consultant';
    profile?: UserProfile;
    consultantProfile?: ConsultantProfile;
}