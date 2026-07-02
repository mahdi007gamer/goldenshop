"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { User } from "@/types";

// AuthProvider receives initialUser from the server (layout.tsx).
// This eliminates the "flash of logged-out state" on page load/navigation
// because the user is known before the first client render.

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(initialUser);
  const [isLoading, setLoading] = useState(false);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  // After mount, verify the session is still valid (cookie might have expired).
  // This runs once on mount — the initialUser from the server is already showing.
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (json.success && json.data) {
        setUserState(json.data as User);
      } else {
        setUserState(null);
      }
    } catch {
      // Network error — keep the server-provided initialUser
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync if initialUser changes (e.g. navigation re-renders layout)
  useEffect(() => {
    setUserState(initialUser);
  }, [initialUser]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setUser, setLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
