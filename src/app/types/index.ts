export type Tab = "home" | "chat" | "add" | "magazine" | "profile";
export type UserType = "donor" | "hospital";
export type AppScreen = "welcome" | "login" | "register-donor" | "register-hospital" | "main";
export type SubScreen = "none" | "chat-detail" | "article-detail" | "city-select" | "registry" | "book-appointment" | "my-appointments" | "hospital-appointments" | "notifications" | "volunteers-list" | "edit-request";

export interface DonorProfile {
  type: "donor";
  id: string;
  username: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  city: string;
  province: string;
  phone: string;
  address: string;
  weight?: number;
  height?: number;
  eligible: boolean;
  nextEligible?: string;
  lastDonation?: string;
  joinDate: string;
  donations: number;
  gender: "male" | "female";
  diseaseName?: string;
  medicationName?: string;
}

export interface HospitalProfile {
  type: "hospital";
  id: string;
  username: string;
  password: string;
  name: string;
  hospitalType: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  licenseNumber: string;
  managerFirstName: string;
  managerLastName: string;
  managerNationalId: string;
  managerPosition: string;
  managerPhone: string;
  activeRequests: number;
  totalDonors: number;
  totalDonations: number;
  rating: number;
  beds?: number;
  founded?: string;
}

export type UserProfile = DonorProfile | HospitalProfile;

export interface DonorRegistrationData {
  nationalId: string;
  phone: string;
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  address: string;
  bloodType: string;
  weight?: number;
  height?: number;
  gender: "male" | "female";
  password: string;
  diseaseName?: string;
  medicationName?: string;
}

export interface HospitalRegistrationData {
  hospitalId: string;
  name: string;
  hospitalType: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  licenseNumber: string;
  managerFirstName: string;
  managerLastName: string;
  managerNationalId: string;
  managerPosition: string;
  managerPhone: string;
  password: string;
}

// ─── Official Registry Types ──────────────────────────────────────────────────
export interface RegistryDonor {
  nationalId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  gender?: "male" | "female";
}

export interface RegistryHospital {
  hospitalId: string;
  name: string;
  type: string;
  city: string;
  province: string;
  licenseNumber: string;
  address?: string;
}

export type RegistryEntry = RegistryDonor | RegistryHospital;
export type RegistryType = "donor" | "hospital";

// ─── Blood Request Types ───────────────────────────────────────────────────────
export type RequestUrgency = "فوری" | "معمولی";
export type RequestStatus = "active" | "matched" | "completed" | "cancelled";

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  units: number;
  urgency: RequestUrgency;
  deadline: string;
  status: RequestStatus;
  matched: number;
  city: string;
  createdAt: string;
  notes?: string;
}

export interface DonorReadiness {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: string;
  city: string;
  available: boolean;
  readinessDate: string;
  notes?: string;
}

// ─── Chat Types ────────────────────────────────────────────────────────────────
export interface ChatConversation {
  id: string;
  participants: string[];
  hospitalId: string;
  hospitalName: string;
  donorId: string;
  donorName: string;
  requestId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// ─── Appointment Types ─────────────────────────────────────────────────────────
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  requestId: string;
  bloodType: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
}
