import React, { createContext, useContext, useEffect, useState } from "react";

export const AUTH_STORAGE_KEY = "medtracker_auth_session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authSession, setAuthSession] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        setAuthSession(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error("Unable to restore saved user session.", error);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = (session) => {
    setAuthSession(session);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  };

  const updateCurrentUser = (user) => {
    setAuthSession((current) => {
      const nextSession = current ? { ...current, user } : { token: null, user };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      return nextSession;
    });
  };

  const logout = () => {
    setAuthSession(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        authSession,
        token: authSession?.token || null,
        currentUser: authSession?.user || null,
        isAuthenticated: Boolean(authSession?.token),
        isAuthReady,
        login,
        updateCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
