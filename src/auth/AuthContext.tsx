import { createContext, useContext, useState, useMemo } from "react";
import type { PropsWithChildren } from "react";

type AuthContextValue = {
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [userName, setUserName] = useState<string | null>(() => {
    return localStorage.getItem("userName");
  });

  const login = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name);
  };

  const logout = () => {
    setUserName(null);
    localStorage.removeItem("userName");
  };

  const value = useMemo(() => ({ userName, login, logout }), [userName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
