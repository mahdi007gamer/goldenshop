import { create } from "zustand";
import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { User, LoginInput, RegisterInput, ResetPasswordInput } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingRegister: RegisterInput | null;
  sessionChecked: boolean;

  login: (data: LoginInput) => Promise<{ user: User }>;
  loginWithSms: (phone: string) => Promise<void>;
  verifySmsLogin: (phone: string, code: string) => Promise<{ user: User }>;
  register: (data: RegisterInput) => Promise<void>;
  verifyRegister: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  forgotPassword: (phone: string) => Promise<void>;
  resetPassword: (data: ResetPasswordInput) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingRegister: null,
  sessionChecked: false,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.post<User>(API.auth.login, data);
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  loginWithSms: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.auth.loginSms, { phone });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send SMS";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifySmsLogin: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.post<User>(API.auth.loginSmsVerify, { phone, code });
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null, pendingRegister: data });
    try {
      await api.post(API.auth.register, { ...data, step: "request-otp" });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      set({ error: message, isLoading: false, pendingRegister: null });
      throw err;
    }
  },

  verifyRegister: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const pending = get().pendingRegister;
      if (!pending) {
        throw new Error("No pending registration. Please start again.");
      }
      const user = await api.post<User>(API.auth.register, {
        step: "verify",
        username: pending.username,
        phone,
        password: pending.password,
        code,
      });
      set({ user, isAuthenticated: true, isLoading: false, pendingRegister: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post(API.auth.logout);
    } finally {
      set({ user: null, isAuthenticated: false, pendingRegister: null });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const user = await api.get<User>(API.auth.session);
        set({ user, isAuthenticated: true, sessionChecked: true, isLoading: false });
        return;
      } catch (err) {
        lastError = err;
        let isRetryable = false;
        if (err instanceof Error) {
          if (err.message === "Network error. Please check your connection." ||
              err.message === "Failed to fetch") {
            isRetryable = true;
          }
          if ("status" in err && typeof (err as { status: unknown }).status === "number") {
            const status = (err as { status: number }).status;
            if (status >= 500) isRetryable = true;
          }
        }
        if (!isRetryable) break;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    set((state) => ({
      ...(state.user ? {} : { isAuthenticated: false }),
      sessionChecked: true,
      isLoading: false,
    }));
  },

  forgotPassword: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.auth.forgotPassword, { phone, step: "request-otp" });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset SMS";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.auth.resetPassword, { ...data, step: "reset" });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (data) => {
    if (!get().user) return;
    set({ isLoading: true, error: null });
    try {
      const updated = await api.put<User>(API.users.profile(get().user!.id), data);
      set({ user: updated, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user, isAuthenticated: user !== null }),
}));
