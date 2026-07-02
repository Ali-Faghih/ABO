import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  DonorProfile,
  DonorRegistrationData,
  HospitalProfile,
  HospitalRegistrationData,
  UserProfile,
  UserType,
} from "../types";
import {
  clearSession,
  findUser,
  getSessionUserId,
  getUserById,
  saveUser,
  setSession,
  usernameExists,
} from "../services/authStorage";

interface AuthContextValue {
  user: UserProfile | null;
  userType: UserType;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, type: UserType) => { success: boolean; error?: string };
  logout: () => void;
  enterGuestMode: () => void;
  registerDonor: (data: DonorRegistrationData) => { success: boolean; error?: string };
  registerHospital: (data: HospitalRegistrationData) => { success: boolean; error?: string };
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function createDonorProfile(data: DonorRegistrationData): DonorProfile {
  const today = new Date().toLocaleDateString("fa-IR");
  return {
    type: "donor",
    id: crypto.randomUUID(),
    username: data.nationalId.trim(),
    password: data.password,
    name: `${data.firstName} ${data.lastName}`,
    firstName: data.firstName,
    lastName: data.lastName,
    bloodType: data.bloodType,
    city: data.city,
    province: data.province,
    phone: data.phone,
    address: data.address,
    weight: data.weight,
    height: data.height,
    eligible: true,
    joinDate: today,
    donations: 0,
    gender: data.gender,
    diseaseName: data.diseaseName,
    medicationName: data.medicationName,
  };
}

function createHospitalProfile(data: HospitalRegistrationData): HospitalProfile {
  return {
    type: "hospital",
    id: crypto.randomUUID(),
    username: data.hospitalId.trim(),
    password: data.password,
    name: data.name,
    hospitalType: data.hospitalType,
    city: data.city,
    province: data.province,
    address: data.address,
    phone: data.phone,
    licenseNumber: data.licenseNumber,
    managerFirstName: data.managerFirstName,
    managerLastName: data.managerLastName,
    managerNationalId: data.managerNationalId,
    managerPosition: data.managerPosition,
    managerPhone: data.managerPhone,
    activeRequests: 0,
    totalDonors: 0,
    totalDonations: 0,
    rating: 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = getSessionUserId();
    if (userId) {
      const stored = getUserById(userId);
      if (stored) {
        setUser(stored);
        setIsGuest(false);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((profile: UserProfile) => {
    saveUser(profile);
    setSession(profile.id);
    setUser(profile);
    setIsGuest(false);
  }, []);

  const login = useCallback((username: string, password: string, type: UserType) => {
    if (!username.trim() || !password) {
      return { success: false, error: "لطفاً نام کاربری و رمز عبور را وارد کنید." };
    }
    const found = findUser(username, password, type);
    if (!found) {
      return { success: false, error: "اطلاعات ورود نادرست است یا حسابی با این مشخصات وجود ندارد." };
    }
    setSession(found.id);
    setUser(found);
    setIsGuest(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsGuest(false);
  }, []);

  const enterGuestMode = useCallback(() => {
    clearSession();
    setUser(null);
    setIsGuest(true);
  }, []);

  const registerDonor = useCallback((data: DonorRegistrationData) => {
    if (usernameExists(data.nationalId)) {
      return { success: false, error: "این کد ملی قبلاً ثبت شده است." };
    }
    persistUser(createDonorProfile(data));
    return { success: true };
  }, [persistUser]);

  const registerHospital = useCallback((data: HospitalRegistrationData) => {
    if (usernameExists(data.hospitalId)) {
      return { success: false, error: "این کد بیمارستان قبلاً ثبت شده است." };
    }
    persistUser(createHospitalProfile(data));
    return { success: true };
  }, [persistUser]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates } as UserProfile;
      saveUser(updated);
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    userType: user?.type ?? "donor",
    isGuest,
    isAuthenticated: !!user && !isGuest,
    isLoading,
    login,
    logout,
    enterGuestMode,
    registerDonor,
    registerHospital,
    updateProfile,
  }), [user, isGuest, isLoading, login, logout, enterGuestMode, registerDonor, registerHospital, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
