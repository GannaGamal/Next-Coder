import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isLightMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isLightMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('nc-theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('nc-theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('nc-theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
