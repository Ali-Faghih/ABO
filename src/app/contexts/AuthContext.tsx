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
  registerDonor as authRegisterDonor,
  registerHospital as authRegisterHospital,
} from "../services/authStorage";
import { api } from "../services/api";

interface AuthContextValue {
  user: UserProfile | null;
  userType: UserType;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, type: UserType) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  enterGuestMode: () => void;
  registerDonor: (data: DonorRegistrationData) => Promise<{ success: boolean; error?: string }>;
  registerHospital: (data: HospitalRegistrationData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = getSessionUserId();
    if (userId) {
      getUserById(userId).then((stored) => {
        if (stored) {
          setUser(stored);
          setIsGuest(false);
        } else {
          clearSession();
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const persistUser = useCallback(async (profile: UserProfile) => {
    await saveUser(profile);
    setSession(profile.id);
    setUser(profile);
    setIsGuest(false);
  }, []);

  const login = useCallback(async (username: string, password: string, type: UserType) => {
    if (!username.trim() || !password) {
      return { success: false, error: "لطفاً نام کاربری و رمز عبور را وارد کنید." };
    }
    const found = await findUser(username, password, type);
    if (!found) {
      return { success: false, error: "اطلاعات ورود نادرست است یا حسابی با این مشخصات وجود ندارد." };
    }
    setSession(found.id);
    setUser(found);
    setIsGuest(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    api("POST", "/auth/logout").catch(() => {});
    clearSession();
    setUser(null);
    setIsGuest(false);
  }, []);

  const enterGuestMode = useCallback(() => {
    clearSession();
    setUser(null);
    setIsGuest(true);
  }, []);

  const registerDonor = useCallback(async (data: DonorRegistrationData) => {
    const exists = await usernameExists(data.nationalId);
    if (exists) {
      return { success: false, error: "این کد ملی قبلاً ثبت شده است." };
    }
    const result = await authRegisterDonor(data);
    if (!result.success) return result;
    const profile = await login(data.nationalId, data.password, "donor");
    return profile;
  }, [login]);

  const registerHospital = useCallback(async (data: HospitalRegistrationData) => {
    const exists = await usernameExists(data.hospitalId);
    if (exists) {
      return { success: false, error: "این کد بیمارستان قبلاً ثبت شده است." };
    }
    const result = await authRegisterHospital(data);
    if (!result.success) return result;
    const profile = await login(data.hospitalId, data.password, "hospital");
    return profile;
  }, [login]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
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
