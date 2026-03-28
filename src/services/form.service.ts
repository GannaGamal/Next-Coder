import { FORM_BASE } from './api.config';

// ─────────────────────────────────────────────
// Shared helper
// ─────────────────────────────────────────────

const submitForm = async (url: string, data: Record<string, string>): Promise<void> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Form submission failed (${response.status})`);
  }
};

// ─────────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Submits the public contact form */
export const submitContactForm = async (data: ContactFormData): Promise<void> => {
  await submitForm(`${FORM_BASE}/d5v7lj4kjhtioh5js2qg`, data as Record<string, string>);
};

// ─────────────────────────────────────────────
// Rate Us Form
// ─────────────────────────────────────────────

export interface RateUsFormData {
  rating: string;   // stringified number e.g. "5"
  name: string;
  email: string;
  comment: string;
}

/** Submits the platform review / rate-us form */
export const submitRateUsForm = async (data: RateUsFormData): Promise<void> => {
  await submitForm(`${FORM_BASE}/d64f4qr0723ekv2itqc0`, data as Record<string, string>);
};

// ─────────────────────────────────────────────
// User Rating Form (peer rating)
// ─────────────────────────────────────────────

export interface UserRatingFormData {
  rated_user_id: string;
  rated_user_name: string;
  rater_name: string;
  rating: string;   // stringified number e.g. "4"
  comment: string;
}

/** Submits a peer rating for another user's profile */
export const submitUserRating = async (data: UserRatingFormData): Promise<void> => {
  await submitForm(`${FORM_BASE}/d64gfftsi3r5mpi9vc8g`, data as Record<string, string>);
};
