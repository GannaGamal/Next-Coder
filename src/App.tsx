import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { ViewAsProvider } from './contexts/ViewAsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <ThemeProvider>
        <AuthProvider>
          <ViewAsProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </ViewAsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
