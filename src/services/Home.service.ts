import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface Review {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface SubmitReviewPayload {
  rating: number;
  comment: string;
}

export const submitReview = async (payload: SubmitReviewPayload): Promise<void> => {
  const response = await fetch(`${API_BASE}/Home/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const getReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE}/Home/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error('Unable to load reviews.');
  }

  return body.data as Review[];
};

export const getReviewSummary = async (): Promise<ReviewSummary> => {
  const response = await fetch(`${API_BASE}/Home/reviews-summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error('Unable to load review summary.');
  }

  return body.data as ReviewSummary;
};