import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadSharedUserImage, deleteUserImage } from '../services/user.image.service';

interface UseProfilePhotoReturn {
  photoLoading: boolean;
  photoError: string | null;
  handlePhotoUpload: (file: File) => Promise<void>;
  handlePhotoRemove: () => Promise<void>;
}

const readImagePreview = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Could not preview this image.'));
    reader.readAsDataURL(file);
  });

/**
 * Shared hook for all profile pages to upload / delete a profile photo
 * via the real API, with optimistic UI update.
 */
const useProfilePhoto = (): UseProfilePhotoReturn => {
  const { updateUser } = useAuth();
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoUpload = async (file: File): Promise<void> => {
    setPhotoLoading(true);
    setPhotoError(null);

    try {
      const preview = await readImagePreview(file);
      updateUser({ avatar: preview });

      const url = await uploadSharedUserImage(file);
      // Replace preview with the real server URL when available
      if (url) updateUser({ avatar: url });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Photo upload failed');
      // Keep the local preview so the UI doesn't go blank
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoRemove = async (): Promise<void> => {
    setPhotoLoading(true);
    setPhotoError(null);

    // Optimistic remove
    updateUser({ avatar: undefined });

    try {
      await deleteUserImage();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Photo removal failed');
    } finally {
      setPhotoLoading(false);
    }
  };

  return { photoLoading, photoError, handlePhotoUpload, handlePhotoRemove };
};

export default useProfilePhoto;
