import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { submitUserRating } from '../../../services/form.service';

interface UserRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  userAvatar: string;
}

const UserRatingModal = ({
  isOpen,
  onClose,
  userName,
  userId,
  userAvatar,
}: UserRatingModalProps) => {
  const { isLightMode } = useTheme();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [raterName, setRaterName] = useState('');

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await submitUserRating({
        rated_user_id: userId,
        rated_user_name: userName,
        rater_name: raterName,
        rating: rating.toString(),
        comment,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setRaterName('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-md ${
        isLightMode
          ? 'bg-white border-gray-200'
          : 'bg-[#1e2442] border-white/10'
      }`}>
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors ${
            isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-emerald-500/20 rounded-full">
              <i className="ri-check-line text-3xl text-emerald-400"></i>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Thank You!</h3>
            <p className={`mb-6 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Your rating for {userName} has been submitted.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <form id="user-rating-form" data-readdy-form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  Rate {userName}
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Share your experience</p>
              </div>
            </div>

            {/* Stars */}
            <div className="mb-6">
              <label className={`block text-sm mb-3 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                  >
                    <i
                      className={`text-2xl ${
                        star <= (hoverRating || rating)
                          ? 'ri-star-fill text-yellow-400'
                          : `ri-star-line ${isLightMode ? 'text-gray-300' : 'text-gray-500'}`
                      }`}
                    ></i>
                  </button>
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="text-sm text-yellow-500 font-medium ml-2">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Your Name
              </label>
              <input
                type="text"
                name="rater_name"
                value={raterName}
                onChange={(e) => setRaterName(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${
                  isLightMode
                    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
                placeholder="Enter your name"
              />
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Comment (Optional)
              </label>
              <textarea
                name="comment"
                value={comment}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setComment(e.target.value);
                }}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 resize-none transition-colors ${
                  isLightMode
                    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
                rows={3}
                placeholder="Share your experience working with this user..."
                maxLength={500}
              />
              <p className={`text-xs mt-1 text-right ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {comment.length}/500
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isLightMode
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserRatingModal;
