import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { submitReview, getReviews, getReviewSummary } from '../../services/Home.service.ts';
import type { Review, ReviewSummary } from '../../services/Home.service.ts';

const IMAGE_BASE = 'https://nextcoder.runasp.net/';

const RateUs: React.FC = () => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  const ratingLabels = ['', t('rateUs.ratingPoor'), t('rateUs.ratingFair'), t('rateUs.ratingGood'), t('rateUs.ratingVeryGood'), t('rateUs.ratingExcellent')];

  useEffect(() => {
    let active = true;
    const load = async () => {
      setReviewsLoading(true);
      try {
        const [reviewsData, summaryData] = await Promise.all([getReviews(), getReviewSummary()]);
        if (!active) return;
        setReviews(reviewsData);
        setSummary(summaryData);
      } catch {
        // fail silently — reviews are non-critical
      } finally {
        if (active) setReviewsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (rating === 0) { setError(t('rateUs.errorSelectRating')); return; }
    if (!comment.trim()) { setError(t('rateUs.errorWriteComment')); return; }
    if (comment.length > 500) { setError(t('rateUs.errorCommentLength')); return; }

    setSubmitting(true);
    try {
      await submitReview({ rating, comment });
      setSubmitted(true);
      // refresh reviews and summary after submission
      const [reviewsData, summaryData] = await Promise.all([getReviews(), getReviewSummary()]);
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'We could not submit your feedback right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  const resolveAvatar = (userImage: string) => {
    if (!userImage) return '';
    if (userImage.startsWith('http')) return userImage;
    return `${IMAGE_BASE}${userImage}`;
  };

  const avgRating = summary ? summary.averageRating.toFixed(1) : '—';
  const totalReviews = summary ? summary.totalReviews : 0;

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
            <i className="ri-star-fill text-yellow-400"></i>
            <span className="text-sm text-yellow-400 font-medium">{t('rateUs.weValueFeedback')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('rateUs.heroTitle').replace('Next Coder', '')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Next Coder
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            {t('rateUs.heroSubtitle')}
          </p>

          {/* Average Rating */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="text-5xl font-bold text-white">{avgRating}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={`ri-star-fill text-xl ${summary && star <= Math.round(summary.averageRating) ? 'text-yellow-400' : 'text-white/20'}`}></i>
                ))}
              </div>
              <div className="text-sm text-white/50">
                {t('rateUs.basedOn')} {totalReviews} {t('rateUs.reviews')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sticky top-24">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-full mx-auto mb-4">
                      <i className="ri-check-line text-3xl text-green-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('rateUs.thankYouTitle')}</h3>
                    <p className="text-white/60 text-sm mb-6">{t('rateUs.thankYouMsg')}</p>
                    <button
                      onClick={() => { setSubmitted(false); setRating(0); setComment(''); }}
                      className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap text-sm"
                    >
                      {t('rateUs.submitAnother')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-white mb-4">{t('rateUs.leaveReview')}</h3>

                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                        <i className="ri-error-warning-line text-red-400 mr-2 mt-0.5"></i>
                        <span className="text-sm text-red-400">{error}</span>
                      </div>
                    )}

                    <form
                      id="rate-us-form"
                      data-readdy-form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Star Rating */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('rateUs.yourRating')}</label>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="cursor-pointer p-1 transition-transform hover:scale-110"
                              >
                                <i
                                  className={`ri-star-fill text-2xl transition-colors ${
                                    star <= (hoverRating || rating)
                                      ? 'text-yellow-400'
                                      : 'text-white/20'
                                  }`}
                                ></i>
                              </button>
                            ))}
                          </div>
                          {(hoverRating || rating) > 0 && (
                            <span className="text-sm text-yellow-400 font-medium">
                              {ratingLabels[hoverRating || rating]}
                            </span>
                          )}
                        </div>
                        <input type="hidden" name="rating" value={rating} />
                      </div>

                      {/* Comment */}
                      <div>
                        <label htmlFor="rate-comment" className="block text-sm font-medium text-white/80 mb-2">{t('rateUs.comment')}</label>
                        <textarea id="rate-comment" name="comment" value={comment} onChange={(e) => { if (e.target.value.length <= 500) setComment(e.target.value); }} maxLength={500} placeholder={t('rateUs.commentPlaceholder')} rows={4} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 resize-none" required />
                        <div className="text-xs text-white/40 mt-1 text-right">{comment.length}/500</div>
                      </div>

                      <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">
                        {submitting ? (
                          <span className="flex items-center justify-center">
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            {t('rateUs.submitting')}
                          </span>
                        ) : (
                          <><i className="ri-send-plane-line mr-2"></i>{t('rateUs.submitReview')}</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Existing Reviews */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-bold text-white mb-4">{t('rateUs.recentReviews')}</h3>
              <div className="space-y-4">
                {reviewsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-5 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-1/3" />
                          <div className="h-3 bg-white/10 rounded w-1/4" />
                          <div className="h-12 bg-white/10 rounded" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : reviews.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
                    <i className="ri-chat-3-line text-4xl text-white/20 mb-2 block"></i>
                    <p className="text-white/40 text-sm">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {review.userImage ? (
                          <img
                            src={resolveAvatar(review.userImage)}
                            alt={review.userName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white truncate">{review.userName}</span>
                            <span className="text-xs text-white/40 flex-shrink-0 ml-2">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="flex gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-white/20'}`}
                              ></i>
                            ))}
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RateUs;