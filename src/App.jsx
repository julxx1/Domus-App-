import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import DashboardScreen from './screens/DashboardScreen'
import SecurityScreen from './screens/SecurityScreen'
import CameraDetailScreen from './screens/CameraDetailScreen'
import MapScreen from './screens/MapScreen'
import CalendarScreen from './screens/CalendarScreen'
import ChatScreen from './screens/ChatScreen'
import ChatDetailScreen from './screens/ChatDetailScreen'
import MercadoScreen from './screens/MercadoScreen'
import ProfileScreen from './screens/ProfileScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import SettingsScreen from './screens/SettingsScreen'

function RequireAuth({ children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Splash />
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  if (session && !profile?.household_id) return <Navigate to="/onboarding" replace />
  return children
}

function Splash() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--d-cream)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: 'var(--d-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 22px rgba(201,123,74,0.35)',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F5EFE6" strokeWidth="2" strokeLinejoin="round">
          <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-8.5z"/>
          <circle cx="12" cy="14" r="1.5" fill="#F5EFE6"/>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--d-ink)', fontWeight: 600, fontStyle: 'italic' }}>
        Domus
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ height: '100dvh', width: '100vw', background: 'var(--d-cream)', overflow: 'hidden' }}>
        <Routes>
          <Route path="/login"      element={<LoginScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/" element={<RequireAuth><DashboardScreen /></RequireAuth>} />
          <Route path="/dashboard"  element={<RequireAuth><DashboardScreen /></RequireAuth>} />
          <Route path="/security"   element={<RequireAuth><SecurityScreen /></RequireAuth>} />
          <Route path="/security/detail/:id" element={<RequireAuth><CameraDetailScreen /></RequireAuth>} />
          <Route path="/map"        element={<RequireAuth><MapScreen /></RequireAuth>} />
          <Route path="/calendar"   element={<RequireAuth><CalendarScreen /></RequireAuth>} />
          <Route path="/chat"       element={<RequireAuth><ChatScreen /></RequireAuth>} />
          <Route path="/chat/:channelId" element={<RequireAuth><ChatDetailScreen /></RequireAuth>} />
          <Route path="/mercado"    element={<RequireAuth><MercadoScreen /></RequireAuth>} />
          <Route path="/profile"    element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsScreen /></RequireAuth>} />
          <Route path="/settings"   element={<RequireAuth><SettingsScreen /></RequireAuth>} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
