import { useCallback, useEffect, useState } from "react";

// ─── Admin Credentials ──────────────────────────────────────────
// Change these values to set your admin username and password.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const SESSION_KEY = "admin_session";

interface AdminSession {
  username: string;
  loggedInAt: number;
}

interface UseAdminAuthReturn {
  isLoggedIn: boolean;
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AdminSession;
    } catch {
      return null;
    }
  });

  // Sync state to sessionStorage
  useEffect(() => {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const login = useCallback((username: string, password: string): boolean => {
    if (
      username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const newSession: AdminSession = {
        username: username.trim(),
        loggedInAt: Date.now(),
      };
      // Write synchronously so any new component mounting after navigate() reads it immediately
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return {
    isLoggedIn: !!session,
    username: session?.username ?? "",
    login,
    logout,
  };
}
