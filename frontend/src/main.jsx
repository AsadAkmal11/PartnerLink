import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import './styles/index.css';
import App from './App.jsx';
import ThemeProvider from './theme/ThemeProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary
      fallback={
        <div style={{ padding: 48, color: '#fafafa', fontFamily: 'system-ui' }}>
          Something went wrong loading PartnerLink. Check the console and refresh.
        </div>
      }
    >
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
