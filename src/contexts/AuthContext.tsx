import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { loginUser, refreshToken, revokeToken, impersonateRole, exitImpersonationApi } from '../services/auth.service';
import type { AuthResponse } from '../services/auth.service';
import { buildImageUrl } from '../services/user.image.service';
import { AUTH_EXPIRED_EVENT } from '../services/api.utils';

// Refresh buffer: refresh 90 seconds before expiry
const REFRESH_BUFFER_MS = 90_000;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginDirectly: (user: User) => void;
  impersonate: (role: string) => Promise<void>;
  exitImpersonation: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, roles: UserRole[]) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addRole: (role: UserRole) => Promise<void>;
  removeRole: (role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasValidToken = (): boolean => {
    const token = localStorage.getItem('authToken') ?? '';
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };

      if (typeof payload.exp === 'number') {
        return payload.exp * 1000 > Date.now();
      }

      return true;
    } catch {
      return false;
    }
  };

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  // ── Token refresh helpers ──────────────────────────────────────────────────

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  /**
   * Schedules an automatic token refresh 90 s before `expiration`.
   * If the expiration is already past (or within buffer), refreshes immediately.
   */
  const scheduleTokenRefresh = (expiration: string) => {
    clearRefreshTimer();

    if (!expiration || expiration.startsWith('0001-01-01')) {
      // Ignore default/empty C# DateTime values which indicate no refresh token
      return;
    }

    const expiresAt = new Date(expiration).getTime();
    if (!Number.isFinite(expiresAt)) {
      // Ignore malformed expiration values instead of triggering immediate logout.
      return;
    }

    const delay = Math.max(0, expiresAt - Date.now() - REFRESH_BUFFER_MS);

    refreshTimerRef.current = window.setTimeout(async () => {
      try {
        const data = await refreshToken();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Update user with new expiration if returned
        if (data.refreshTokenExpiration) {
          setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, refreshTokenExpiration: data.refreshTokenExpiration! };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
          scheduleTokenRefresh(data.refreshTokenExpiration);
        }
      } catch {
        // Keep local session on refresh failures (method/cookie/CORS mismatches)
        // and let normal API 401 flows handle a real expired session.
        clearRefreshTimer();
      }
    }, delay);
  };

  // ── Internal logout (no revoke, used when refresh fails) ──────────────────

  const doLogout = () => {
    clearRefreshTimer();
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // ── On mount: restore session + schedule refresh ───────────────────────────

  useEffect(() => {
    if (!user) {
      setIsAuthReady(true);
      return () => clearRefreshTimer();
    }

    const tokenIsValid = hasValidToken();

    if (!tokenIsValid) {
      doLogout();
      setIsAuthReady(true);
      return () => clearRefreshTimer();
    }

    if (tokenIsValid) {
      // Schedule refresh if we know the expiration
      if (user.refreshTokenExpiration) {
        scheduleTokenRefresh(user.refreshTokenExpiration);
      }
    }

    setIsAuthReady(true);

    return () => clearRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.refreshTokenExpiration]);

  useEffect(() => {
    const syncSessionWithToken = () => {
      if (user && !hasValidToken()) {
        doLogout();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authToken' || event.key === 'user') {
        syncSessionWithToken();
      }
    };

    window.addEventListener('focus', syncSessionWithToken);
    window.addEventListener('storage', handleStorage);

    const handleAuthExpired = () => {
      if (localStorage.getItem('authToken')) {
        doLogout();
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired as EventListener);

    return () => {
      window.removeEventListener('focus', syncSessionWithToken);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired as EventListener);
    };
  }, [user]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string, rememberMe = false) => {
    const data: AuthResponse = await loginUser(email, password, rememberMe);

    if (!data.isAuthenticated || !data.token) {
      throw new Error('Login failed: missing or invalid authentication token from server.');
    }

    if (data.token) localStorage.setItem('authToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    const normalizeRole = (r: string): UserRole => {
      const lower = r.toLowerCase().trim();
      if (lower === 'job seeker' || lower === 'job-seeker') return 'applicant';
      return lower as UserRole;
    };
    const normalizedRoles = (data.roles ?? []).map(normalizeRole);

    const avatarUrl = data.imageUrl ? buildImageUrl(data.imageUrl) : '';

    const loggedInUser: User = {
      id: data.userId || String(Date.now()),
      email: data.email || email,
      name: data.fullName || email.split('@')[0],
      roles: normalizedRoles,
      avatar: avatarUrl,
      createdAt: new Date().toISOString(),
      jobSeekerId: data.jobSeekerId,
      employerId: data.employerId,
      learnerId: data.learnerId,
      clientId: data.clientId,
      freeLancerId: data.freeLancerId,
      refreshTokenExpiration: data.refreshTokenExpiration,
      refreshToken: data.refreshToken ?? null,
    };

    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    // Schedule token auto-refresh
    if (data.refreshTokenExpiration) {
      scheduleTokenRefresh(data.refreshTokenExpiration);
    }
  };

  // ── Impersonate ────────────────────────────────────────────────────────────

  const impersonate = async (role: string) => {
    const data: AuthResponse = await impersonateRole(role);

    if (!data.isAuthenticated || !data.token) {
      throw new Error('Impersonation failed: missing or invalid authentication token from server.');
    }

    if (data.token) localStorage.setItem('authToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    const normalizeRole = (r: string): UserRole => {
      const lower = r.toLowerCase().trim();
      if (lower === 'job seeker' || lower === 'job-seeker') return 'applicant';
      return lower as UserRole;
    };
    const normalizedRoles = (data.roles ?? []).map(normalizeRole);

    const avatarUrl = data.imageUrl ? buildImageUrl(data.imageUrl) : '';

    const loggedInUser: User = {
      id: data.userId || String(Date.now()),
      email: data.email || '',
      name: data.fullName || data.email?.split('@')[0] || '',
      roles: normalizedRoles,
      avatar: avatarUrl,
      createdAt: new Date().toISOString(),
      jobSeekerId: data.jobSeekerId,
      employerId: data.employerId,
      learnerId: data.learnerId,
      clientId: data.clientId,
      freeLancerId: data.freeLancerId,
      refreshTokenExpiration: data.refreshTokenExpiration,
      refreshToken: data.refreshToken ?? null,
    };

    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    // Schedule token auto-refresh
    if (data.refreshTokenExpiration) {
      scheduleTokenRefresh(data.refreshTokenExpiration);
    }
  };

  // ── Exit Impersonation ─────────────────────────────────────────────────────

  const exitImpersonation = async () => {
    const data: AuthResponse = await exitImpersonationApi();

    if (!data.isAuthenticated || !data.token) {
      throw new Error('Exit impersonation failed: missing or invalid authentication token from server.');
    }

    if (data.token) localStorage.setItem('authToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    const normalizeRole = (r: string): UserRole => {
      const lower = r.toLowerCase().trim();
      if (lower === 'job seeker' || lower === 'job-seeker') return 'applicant';
      return lower as UserRole;
    };
    const normalizedRoles = (data.roles ?? []).map(normalizeRole);

    const avatarUrl = data.imageUrl ? buildImageUrl(data.imageUrl) : '';

    const loggedInUser: User = {
      id: data.userId || String(Date.now()),
      email: data.email || '',
      name: data.fullName || data.email?.split('@')[0] || '',
      roles: normalizedRoles,
      avatar: avatarUrl,
      createdAt: new Date().toISOString(),
      jobSeekerId: data.jobSeekerId,
      employerId: data.employerId,
      learnerId: data.learnerId,
      clientId: data.clientId,
      freeLancerId: data.freeLancerId,
      refreshTokenExpiration: data.refreshTokenExpiration,
      refreshToken: data.refreshToken ?? null,
    };

    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    // Schedule token auto-refresh
    if (data.refreshTokenExpiration) {
      scheduleTokenRefresh(data.refreshTokenExpiration);
    }
  };

  // ── Login directly (OTP confirm etc.) ─────────────────────────────────────

  const loginDirectly = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newUser.refreshToken) {
      localStorage.setItem('refreshToken', newUser.refreshToken);
    }
    setUser(newUser);
    if (newUser.refreshTokenExpiration) {
      scheduleTokenRefresh(newUser.refreshTokenExpiration);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = async () => {
    const accessToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken') ?? user?.refreshToken ?? '';
    if (accessToken && refreshToken) {
      // RevokeToken DTO uses `token` for the refresh token value.
      await revokeToken(accessToken, refreshToken);
    }
    doLogout();
  };

  // ── Register ───────────────────────────────────────────────────────────────

  const register = async (email: string, _password: string, name: string, roles: UserRole[]) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      roles,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  // ── User mutations ─────────────────────────────────────────────────────────

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const addRole = async (role: UserRole) => {
    if (user && !user.roles.includes(role)) {
      const updatedUser = { ...user, roles: [...user.roles, role] };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      try {
        const data = await refreshToken();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        const normalizeRole = (value: string): UserRole => {
          const lower = value.toLowerCase().trim();
          if (lower === 'job seeker' || lower === 'job-seeker') return 'applicant';
          return lower as UserRole;
        };

        const syncedRoles = Array.isArray(data.roles) && data.roles.length > 0
          ? Array.from(new Set(data.roles.map(normalizeRole).concat(updatedUser.roles)))
          : updatedUser.roles;

        const syncedUser: User = {
          ...updatedUser,
          roles: syncedRoles,
          jobSeekerId: data.jobSeekerId ?? updatedUser.jobSeekerId,
          employerId: data.employerId ?? updatedUser.employerId,
          learnerId: data.learnerId ?? updatedUser.learnerId,
          clientId: data.clientId ?? updatedUser.clientId,
          freeLancerId: data.freeLancerId ?? updatedUser.freeLancerId,
          refreshTokenExpiration: data.refreshTokenExpiration ?? updatedUser.refreshTokenExpiration,
          refreshToken: data.refreshToken ?? updatedUser.refreshToken,
        };

        localStorage.setItem('user', JSON.stringify(syncedUser));
        setUser(syncedUser);
      } catch {
        // Keep the locally updated role even if token refresh is temporarily unavailable.
      }
    }
  };

  const removeRole = async (role: UserRole) => {
    if (user && user.roles.includes(role)) {
      const updatedUser = { ...user, roles: user.roles.filter((r) => r !== role) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      try {
        const data = await refreshToken();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        const normalizeRole = (value: string): UserRole => {
          const lower = value.toLowerCase().trim();
          if (lower === 'job seeker' || lower === 'job-seeker') return 'applicant';
          return lower as UserRole;
        };

        const syncedRoles = Array.isArray(data.roles) && data.roles.length > 0
          ? Array.from(new Set(data.roles.map(normalizeRole)))
          : updatedUser.roles;

        const syncedUser: User = {
          ...updatedUser,
          roles: syncedRoles,
          jobSeekerId: data.jobSeekerId ?? updatedUser.jobSeekerId,
          employerId: data.employerId ?? updatedUser.employerId,
          learnerId: data.learnerId ?? updatedUser.learnerId,
          clientId: data.clientId ?? updatedUser.clientId,
          freeLancerId: data.freeLancerId ?? updatedUser.freeLancerId,
          refreshTokenExpiration: data.refreshTokenExpiration ?? updatedUser.refreshTokenExpiration,
          refreshToken: data.refreshToken ?? updatedUser.refreshToken,
        };

        localStorage.setItem('user', JSON.stringify(syncedUser));
        setUser(syncedUser);
      } catch {
        // Keep the locally updated role even if token refresh is temporarily unavailable.
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginDirectly, impersonate, exitImpersonation, logout, register, updateUser, addRole, removeRole, isAuthenticated: !!user && hasValidToken(), isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};
