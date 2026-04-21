import { API_BASE } from './api.config';
import { parseApiError, collectApiErrors } from './api.utils';

// ─────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────

/**
 * The flat response shape returned by /Auth/Login and /Auth/confirmEmailOtp.
 * All fields map directly from the API — no nested user object.
 */
export interface AuthResponse {
  message: string | null;
  isAuthenticated: boolean;
  email: string;
  roles: string[];
  token: string;
  fullName: string;
  userId: string;
  jobSeekerId: string | null;
  employerId: string | null;
  learnerId: string | null;
  clientId: string | null;
  freeLancerId: string | null;
  refreshTokenExpiration: string | null;
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

/**
 * POST /Auth/Login
 * Throws an error string on failure. Returns AuthResponse on success.
 */
export const loginUser = async (
  email: string,
  password: string,
  rememberMe = false
): Promise<AuthResponse> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Auth/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
  } catch {
    throw new Error('We could not sign you in right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const rawText = await response.text();
  try {
    const parsed = JSON.parse(rawText) as Partial<AuthResponse>;

    if (!parsed?.isAuthenticated || !parsed?.token) {
      throw new Error('Login response is missing authentication token.');
    }

    return parsed as AuthResponse;
  } catch {
    throw new Error('Login failed: invalid response from server. Please try again.');
  }
};

// ─────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────

/**
 * POST /Auth/Register (multipart/form-data)
 * Returns nothing on success (202/204). Throws string[] of errors on failure.
 */
export const registerUser = async (payload: FormData): Promise<void> => {
  const response = await fetch(`${API_BASE}/Auth/Register`, {
    method: 'POST',
    body: payload,
  });

  if (!response.ok) {
    const errors = await collectApiErrors(response);
    throw errors; // throw string[] so callers can render each message
  }
};

// ─────────────────────────────────────────────
// Confirm Email OTP
// ─────────────────────────────────────────────

/**
 * POST /Auth/confirmEmailOtp
 * Returns AuthResponse on success (may have partial data if API returns minimal body).
 * Throws an error string on failure.
 */
export const confirmEmailOtp = async (
  email: string,
  otp: string
): Promise<Partial<AuthResponse>> => {
  const response = await fetch(`${API_BASE}/Auth/confirmEmailOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const rawText = await response.text();
  try {
    return JSON.parse(rawText) as Partial<AuthResponse>;
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────────
// Resend OTP
// ─────────────────────────────────────────────

/**
 * POST /Auth/resendOtp
 * Throws an error string on failure.
 */
export const resendOtp = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/Auth/resendOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
};

// ─────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────

/**
 * POST /Auth/forgotPassword
 * Sends a password reset OTP to the given email.
 * Throws an error string on failure.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/Auth/forgotPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
};

// ─────────────────────────────────────────────
// Change Password (authenticated)
// ─────────────────────────────────────────────

/**
 * POST /Auth/ChangePassword
 * Requires a valid Bearer token in localStorage.
 * Throws an error string on failure.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  const response = await fetch(`${API_BASE}/Auth/ChangePassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
};

// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * POST /Auth/resetPassword
 * Throws an error string on failure.
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  const response = await fetch(`${API_BASE}/Auth/resetPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
};

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────

/**
 * POST /Auth/refreshToken
 * Uses the current Bearer token to obtain a fresh access token + new expiration.
 * Returns partial AuthResponse (at minimum: token + refreshTokenExpiration).
 * Throws on failure.
 */
export const refreshToken = async (): Promise<Partial<AuthResponse>> => {
  const token = localStorage.getItem('authToken') ?? '';
  const requestInit: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include', // send HTTP-only refresh token cookie if used
  };

  // Swagger documents GET; keep POST fallback for backend variants.
  let response = await fetch(`${API_BASE}/Auth/refreshToken`, {
    ...requestInit,
    method: 'GET',
  });

  if (response.status === 405) {
    response = await fetch(`${API_BASE}/Auth/refreshToken`, {
      ...requestInit,
      method: 'POST',
      headers: {
        ...requestInit.headers,
        'Content-Type': 'application/json',
      },
    });
  }

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const rawText = await response.text();
  try {
    return JSON.parse(rawText) as Partial<AuthResponse>;
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────────
// Revoke Token
// ─────────────────────────────────────────────

/**
 * POST /Auth/revokeToken
 * Invalidates the given token on the server (call on logout).
 * Silently ignores network errors — logout should always succeed locally.
 */
export const revokeToken = async (token: string): Promise<void> => {
  const authToken = localStorage.getItem('authToken') ?? '';
  try {
    await fetch(`${API_BASE}/Auth/revokeToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
  } catch {
    // Silently ignore — logout must always succeed on the client
  }
};
