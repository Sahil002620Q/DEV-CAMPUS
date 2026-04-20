import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getUserRole, UserRole } from "../../services/firebase/roles";

type RoleContextValue = {
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCafeteriaAdmin: boolean;
  isLibraryAdmin: boolean;
  roleLoading: boolean;
  refreshRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [roleLoading, setRoleLoading] = useState(true);

  async function fetchRole() {
    if (!session?.uid) {
      setRole("student");
      setRoleLoading(false);
      return;
    }
    try {
      setRoleLoading(true);
      const r = await getUserRole(session.uid);
      setRole(r);
    } finally {
      setRoleLoading(false);
    }
  }

  useEffect(() => {
    fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid]);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      isAdmin: role !== "student",
      isSuperAdmin: role === "super_admin",
      isCafeteriaAdmin: role === "cafeteria_admin" || role === "super_admin",
      isLibraryAdmin: role === "library_admin" || role === "super_admin",
      roleLoading,
      refreshRole: fetchRole,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, roleLoading]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
