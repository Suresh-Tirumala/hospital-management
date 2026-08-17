import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RealTimeProvider } from './context/RealTimeContext';
import Layout from './components/Layout';
import './index.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Patients = lazy(() => import('./pages/Patients'));
const Appointments = lazy(() => import('./pages/Appointments'));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords'));
const Bills = lazy(() => import('./pages/Bills'));
const Users = lazy(() => import('./pages/Users'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MedicalAssistant = lazy(() => import('./features/ai-assistant/pages/MedicalAssistant'));

const PageLoader = () => (
  <div className="loading-container">
    <div className="spinner"></div>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/users" element={<Users />} />
        </Route>

        <Route path="/ai-assistant" element={<MedicalAssistant />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealTimeProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }} />
          <AppRoutes />
        </RealTimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;