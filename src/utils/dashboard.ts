import type { User, UserRole } from '../types';

const ROLE_ALIASES: Record<string, UserRole> = {
  'job seeker': 'applicant',
  'job-seeker': 'applicant',
};

const KNOWN_ROLES: UserRole[] = [
  'freelancer',
  'client',
  'employer',
  'applicant',
  'learner',
  'admin',
];

export const normalizeUserRole = (role?: string | null): UserRole | null => {
  if (!role) {
    return null;
  }

  const normalized = role.toLowerCase().trim();
  if (!normalized) {
    return null;
  }

  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized];
  }

  return KNOWN_ROLES.includes(normalized as UserRole) ? (normalized as UserRole) : null;
};

export const buildDashboardPath = (role?: string | null): string => {
  const normalized = normalizeUserRole(role);
  return normalized ? `/dashboard?role=${encodeURIComponent(normalized)}` : '/dashboard';
};

export const getDashboardPathForUser = (
  user?: User | null,
  preferredRole?: string | null
): string => {
  const normalizedPreferred = normalizeUserRole(preferredRole);
  const roles = Array.isArray(user?.roles) ? user?.roles ?? [] : [];

  if (normalizedPreferred && roles.includes(normalizedPreferred)) {
    return buildDashboardPath(normalizedPreferred);
  }

  if (roles.length === 1) {
    return buildDashboardPath(roles[0]);
  }

  return '/dashboard';
};
