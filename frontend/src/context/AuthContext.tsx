"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface User {
  id: number;
  phone: string;
  email?: string;
  full_name: string;
  role: string;
  language: string;
  pacs_name?: string;
  pacs_registration_number?: string;
  district?: string;
  state?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone_or_email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("coop_token");
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
      api.getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          localStorage.removeItem("coop_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (phone_or_email: string, password: string) => {
    try {
      const res = await api.login({ phone_or_email, password });
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("coop_token", res.access_token);
      api.setToken(res.access_token);
      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.register(data);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("coop_token", res.access_token);
      api.setToken(res.access_token);
      return true;
    } catch (err) {
      console.error("Registration failed", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("coop_token");
    setToken(null);
    setUser(null);
    api.setToken(null);
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
      return true;
    } catch (err) {
      console.error("Update profile failed", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
