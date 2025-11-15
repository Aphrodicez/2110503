import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, registerRequest, getCurrentUser } from "@/services/auth";
import { AuthCredentials, RegisterInput, User } from "@/types";
import { AUTH_TOKEN_KEY } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: (tokenOverride?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const persistToken = (value: string | null) => {
    if (value) {
      localStorage.setItem(AUTH_TOKEN_KEY, value);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  };

  const refreshUser = useCallback(async (tokenOverride?: string | null) => {
    const activeToken = tokenOverride ?? token;
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load current user", error);
      setUser(null);
      setToken(null);
      persistToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const response = await loginRequest(credentials);
    setToken(response.token);
    persistToken(response.token);
    await refreshUser(response.token);
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterInput) => {
    const response = await registerRequest(payload);
    setToken(response.token);
    persistToken(response.token);
    await refreshUser(response.token);
  }, [refreshUser]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, token, isLoading, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
