import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, scheduleDailyReminder, hasNotificationPermission } from './services/notificationService'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker().then(() => {
  if (hasNotificationPermission()) {
    scheduleDailyReminder(20);
  }
});
