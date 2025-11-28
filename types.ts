export enum AppState {
  IDLE = 'IDLE',
  TRIAGE = 'TRIAGE',
  ANALYZING = 'ANALYZING',
  DISPATCHED = 'DISPATCHED',
  ARRIVED = 'ARRIVED'
}

export enum PriorityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface TriageResponse {
  priority: PriorityLevel;
  etaMinutes: number;
  vehicleType: string;
  recommendedAction: string;
  summary: string;
  assistantName: string;
  contactNotificationMessage: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface EmergencyDetails {
  description: string;
  coordinates: Coordinates | null;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalInfo: string;
}