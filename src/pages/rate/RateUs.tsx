import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { submitRateUsForm } from '../../services/form.service';

const RateUs: React.FC = () => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ratingLabels = ['', t('rateUs.ratingPoor'), t('rateUs.ratingFair'), t('rateUs.ratingGood'), t('rateUs.ratingVeryGood'), t('rateUs.ratingExcellent')];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (rating === 0) { setError(t('rateUs.errorSelectRating')); return; }
    if (!name.trim()) { setError(t('rateUs.errorEnterName')); return; }
    if (!email.trim()) { setError(t('rateUs.errorEnterEmail')); return; }
    if (!comment.trim()) { setError(t('rateUs.errorWriteComment')); return; }
    if (comment.length > 500) { setError(t('rateUs.errorCommentLength')); return; }

    setSubmitting(true);
    try {
      await submitRateUsForm({
        rating: rating.toString(),
        name,
        email,
        comment,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('rateUs.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const existingReviews = [
    {
      name: 'Sarah Johnson',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20designer%20portrait%20smiling%20confident%20in%20creative%20workspace%20with%20clean%20bright%20background%20modern%20casual%20attire&width=100&height=100&seq=rev1&orientation=squarish',
      rating: 5,
      comment:
        'Next Coder completely changed my freelance career. The platform is intuitive, the milestone system is fair, and I love the career roadmaps!',
      date: '2 days ago',
    },
    {
      name: 'Michael Chen',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20male%20software%20engineer%20portrait%20friendly%20smile%20in%20tech%20office%20environment%20clean%20background%20business%20casual&width=100&height=100&seq=rev2&orientation=squarish',
      rating: 5,
      comment:
        'Found my dream job through the platform. The CV matching feature is incredibly accurate. Highly recommend for any job seeker.',
      date: '1 week ago',
    },
    {
      name: 'Emily Rodriguez',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20marketing%20manager%20portrait%20confident%20smile%20in%20modern%20office%20clean%20white%20background%20professional%20attire&width=100&height=100&seq=rev3&orientation=squarish',
      rating: 4,
      comment:
        'Great platform for hiring. The filtering system saves hours of screening time. Would love to see more analytics features in the future.',
      date: '2 weeks ago',
    },
    {
      name: 'David Kim',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20male%20developer%20portrait%20approachable%20smile%20clean%20background%20casual%20tech%20attire%20modern%20headshot&width=100&height=100&seq=rev4&orientation=squarish',
      rating: 5,
      comment:
        'The learning roadmaps are fantastic. I went from zero to landing a full-stack developer role in 6 months. The community achievements page is very motivating!',
      date: '3 weeks ago',
    },
  ];

  const avgRating = (
    existingReviews.reduce((acc, r) => acc + r.rating, 0) / existingReviews.length
  ).toFixed(1);

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
                  <i key={star} className={`ri-star-fill text-xl ${star <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-white/20'}`}></i>
                ))}
              </div>
              <div className="text-sm text-white/50">
                {t('rateUs.basedOn')} {existingReviews.length} {t('rateUs.reviews')}
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
                      onClick={() => { setSubmitted(false); setRating(0); setName(''); setEmail(''); setComment(''); }}
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

                      {/* Name */}
                      <div>
                        <label htmlFor="rate-name" className="block text-sm font-medium text-white/80 mb-2">{t('rateUs.name')}</label>
                        <input type="text" id="rate-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('rateUs.namePlaceholder')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50" required />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="rate-email" className="block text-sm font-medium text-white/80 mb-2">{t('rateUs.email')}</label>
                        <input type="email" id="rate-email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('rateUs.emailPlaceholder')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50" required />
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
                {existingReviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">{review.name}</span>
                          <span className="text-xs text-white/40">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`ri-star-fill text-sm ${
                                star <= review.rating ? 'text-yellow-400' : 'text-white/20'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
