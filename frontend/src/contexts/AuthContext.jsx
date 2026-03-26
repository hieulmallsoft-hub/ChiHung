import { createContext, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../utils/storage";

export const AuthContext = createContext(null);

function normalizeRoleName(role) {
  if (!role) return null;
  let normalized = String(role).trim().toUpperCase();
  if (!normalized) return null;
  if (!normalized.startsWith("ROLE_")) {
    normalized = `ROLE_${normalized}`;
  }
  return normalized;
}

function extractRoles(user) {
  if (!user) return [];

  const rawRoles = user.roles ?? user.authorities ?? user.roleNames ?? [];
  const roleList =
    rawRoles instanceof Set
      ? Array.from(rawRoles)
      : Array.isArray(rawRoles)
        ? rawRoles
        : typeof rawRoles === "string"
          ? rawRoles.split(",")
          : [];

  return Array.from(
    new Set(
      roleList
        .map((role) => {
          if (typeof role === "string") return normalizeRoleName(role);
          if (role && typeof role === "object") {
            return normalizeRoleName(role.name || role.authority || role.role);
          }
          return null;
        })
        .filter(Boolean)
    )
  );
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    roles: extractRoles(user),
  };
}

function extractRolesFromAccessToken(accessToken) {
  if (!accessToken) return [];

  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) return [];

    const normalizedBase64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalizedBase64.length % 4 === 0 ? "" : "=".repeat(4 - (normalizedBase64.length % 4));
    const decoded = atob(`${normalizedBase64}${padding}`);
    const payload = JSON.parse(decoded);
    const roles = Array.isArray(payload?.roles) ? payload.roles : [];
    return roles.map(normalizeRoleName).filter(Boolean);
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(normalizeUser(tokenStorage.getUser()));
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenStorage.getAccessToken());
  const [loading, setLoading] = useState(false);

  const applySession = useCallback((payload) => {
    const normalizedUser = normalizeUser(payload.user);
    tokenStorage.setSession({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: normalizedUser,
    });
    setUser(normalizedUser);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const bootstrapAuth = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    if (!accessToken || !refreshToken) {
      clearSession();
      return;
    }

    const cachedUser = normalizeUser(tokenStorage.getUser());
    if (cachedUser) {
      setUser(cachedUser);
    }
    setIsAuthenticated(true);

    if (!cachedUser || cachedUser.roles.length === 0) {
      try {
        const response = await authApi.refresh(refreshToken);
        applySession(response.data.data);
      } catch {
        clearSession();
      }
    }
  }, [applySession, clearSession]);

  const login = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const response = await authApi.login(payload);
        applySession(response.data.data);
        toast.success("Dang nhap thanh cong");
        return response.data.data;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const response = await authApi.register(payload);
        applySession(response.data.data);
        toast.success("Tao tai khoan thanh cong");
        return response.data.data;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore logout failure for client session cleanup
    }
    clearSession();
    toast.success("Da dang xuat");
  }, [clearSession]);

  const hasRole = useCallback(
    (role) => {
      const normalized = normalizeRoleName(role);
      if (!normalized) return false;

      const rolesFromToken = extractRolesFromAccessToken(tokenStorage.getAccessToken());
      if (rolesFromToken.length > 0) {
        return rolesFromToken.includes(normalized);
      }

      return extractRoles(user).includes(normalized);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      hasRole,
      bootstrapAuth,
      clearSession,
    }),
    [user, loading, isAuthenticated, login, register, logout, hasRole, bootstrapAuth, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
