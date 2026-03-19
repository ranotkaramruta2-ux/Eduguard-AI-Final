export type UserRole = 'teacher' | 'student' | 'counselor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  phoneNumber?: string;
  attendancePercentage?: number;
  internalMarks?: number;
  assignmentCompletion?: number;
  familyIncome?: number;
  travelDistance?: number;
  previousFailures?: number;
  engagementScore?: number;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: string;
  riskFactors?: string[];
  counselorType?: 'academic' | 'financial' | 'behavioral' | 'medical' | 'general';
  // financial
  scholarshipStatus?: 'none' | 'partial' | 'full';
  partTimeJob?: boolean;
  numberOfDependents?: number;
  // behavioural
  disciplinaryActions?: number;
  socialMediaHours?: number;
  extracurricularParticipation?: boolean;
  // medical
  hasChronicIllness?: boolean;
  mentalHealthConcern?: boolean;
  missedDueMedical?: number;
  counselorId?: string;
  counselorName?: string;
  counselingStatus?: 'pending' | 'in_progress' | 'resolved';
  userId?: string;
  isRegisteredOnly?: boolean; // Flag for students who only registered but have no academic data
}

export interface CounselingNote {
  id: string;
  studentId: string;
  counselorId: string;
  counselorName: string;
  note: string;
  date: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface Notification {
  id: string;
  message: string;
  type: 'risk' | 'counseling' | 'update';
  read: boolean;
  date: string;
  userId: string;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  teacher: '/teacher',
  student: '/student',
  counselor: '/counselor',
};

export const RISK_COLORS = {
  low: 'hsl(152, 60%, 42%)',
  medium: 'hsl(38, 92%, 50%)',
  high: 'hsl(0, 72%, 55%)',
};
