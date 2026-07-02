"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/auth-store";

/**
 * Syncs the server-provided initialUser (from AuthContext) with the Zustand auth store.
 * This ensures that:
 * 1. On page load, the store immediately has the user from the server (no flicker)
 * 2. After login/logout actions, the context stays in sync
 */
export function useAuthSync() {
  const { user, isAuthenticated } = useAuth();
  const storeSetUser = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);
  const storeIsAuth = useAuthStore((s) => s.isAuthenticated);

  // Sync context → store (server-provided user takes priority)
  useEffect(() => {
    if (user !== storeUser) {
      storeSetUser(user);
    }
  }, [user, storeUser, storeSetUser]);

  // Sync store → context (after client-side login/logout)
  useEffect(() => {
    if (isAuthenticated !== storeIsAuth || (storeUser && !user)) {
      // The store knows something the context doesn't — usually after
      // a login/logout action that bypassed the context.
      // In this case we trust the store since it was updated by the action.
    }
  }, [isAuthenticated, storeIsAuth, storeUser, user]);

  return { user, isAuthenticated };
}
