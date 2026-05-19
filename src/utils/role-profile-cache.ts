export interface ClientProfileEditCache {
  phoneNumber: string;
  country: string;
  websiteUrl: string;
  bio: string;
}

export interface LearnerProfileEditCache {
  bio: string;
  goals: string;
}

const readUserId = (): string => {
  const raw = localStorage.getItem('user');
  if (!raw) return 'current';

  try {
    const parsed = JSON.parse(raw) as { id?: unknown; userId?: unknown };
    return String(parsed.id ?? parsed.userId ?? 'current').trim() || 'current';
  } catch {
    return 'current';
  }
};

const keyFor = (role: string): string => `roleProfile:${readUserId()}:${role}`;

export const readRoleProfileCache = <T>(role: string): Partial<T> | null => {
  const raw = localStorage.getItem(keyFor(role));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Partial<T>;
  } catch {
    return null;
  }
};

export const writeRoleProfileCache = <T extends object>(role: string, value: T): void => {
  localStorage.setItem(keyFor(role), JSON.stringify(value));
};
