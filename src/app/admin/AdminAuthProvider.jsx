"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import adminApi from "@/lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await adminApi.get("/auth/me");
      setUser(data.data.user);
      return data.data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await adminApi.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const can = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === "super_admin") return true;
      const perms = user.permissions || [];
      return perms.includes("*") || perms.includes(permission);
    },
    [user],
  );

  return (
    <AdminAuthContext.Provider value={{ user, loading, can, refresh, logout, setUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
