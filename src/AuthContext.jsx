import React, { createContext, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "medtracker_current_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Unable to restore saved user session.", error);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
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
