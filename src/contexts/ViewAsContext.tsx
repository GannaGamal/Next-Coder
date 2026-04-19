
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types';

interface ViewAsContextType {
  viewingAs: UserRole | null;
  setViewingAs: (role: UserRole | null) => void;
  isViewingAs: boolean;
  exitViewAs: () => void;
}

// Initialise context with undefined so we can enforce provider usage
const ViewAsContext = createContext<ViewAsContextType | undefined>(undefined);

/**
 * Custom hook to consume the ViewAs context.
 * Throws a clear error if used outside of its provider.
 */
export const useViewAs = (): ViewAsContextType => {
  const context = useContext(ViewAsContext);
  if (!context) {
    throw new Error('useViewAs must be used within a ViewAsProvider');
  }
  return context;
};

interface ViewAsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that stores the “view as” state.
 * Includes a small safety net: any unexpected error while updating state
 * will be caught and logged, preventing the whole app from crashing.
 */
export const ViewAsProvider = ({ children }: ViewAsProviderProps) => {
  const [viewingAs, setViewingAs] = useState<UserRole | null>(null);

  const isViewingAs = viewingAs !== null;

  const exitViewAs = () => {
    try {
      setViewingAs(null);
    } catch (error) {
      // Graceful fallback – log the error for debugging
      console.error('Failed to exit view-as mode:', error);
    }
  };

  // Wrap setViewingAs to add error handling
  const safeSetViewingAs = (role: UserRole | null) => {
    try {
      setViewingAs(role);
    } catch (error) {
      console.error('Failed to set view-as role:', error);
    }
  };

  return (
    <ViewAsContext.Provider
      value={{
        viewingAs,
        setViewingAs: safeSetViewingAs,
        isViewingAs,
        exitViewAs,
      }}
    >
      {children}
    </ViewAsContext.Provider>
  );
};
