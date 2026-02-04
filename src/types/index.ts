export type UserRole = 
  | 'patient' 
  | 'doctor' 
  | 'nurse' 
  | 'receptionist' 
  | 'admin' 
  | 'lab' 
  | 'pharmacy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  address: string;
  emergencyContact: string;
  insuranceProvider?: string;
  insuranceId?: string;
  registeredAt: string;
  status: 'active' | 'inactive' | 'discharged';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'procedure';
  notes?: string;
}

export interface Vital {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedAt: string;
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  testType: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  orderedAt: string;
  completedAt?: string;
  results?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  prescribedBy: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  prescribedAt: string;
  dispensedAt?: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinedAt: string;
  specialization?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingLabTests: number;
  pendingPrescriptions: number;
  checkedInPatients: number;
  availableBeds?: number;
}
