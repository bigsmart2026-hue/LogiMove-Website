import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const Tracking = lazy(() => import('./pages/Tracking'));
const DriverAssignment = lazy(() => import('./pages/DriverAssignment'));
const Payment = lazy(() => import('./pages/Payment'));
const Notifications = lazy(() => import('./pages/Notifications'));
const DriverPortal = lazy(() => import('./pages/DriverPortal'));
const FleetManagement = lazy(() => import('./pages/FleetManagement'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));
const WarehouseManagement = lazy(() => import('./pages/WarehouseManagement'));
const InventoryTracking = lazy(() => import('./pages/InventoryTracking'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Drivers = lazy(() => import('./pages/Drivers'));
const QRScan = lazy(() => import('./pages/QRScan'));

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Loader() {
  return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
}

export default function App() {
  useEffect(() => {
    // Preload common routes after mount so navigation feels instant
    import('./pages/Dashboard');
    import('./pages/Booking');
    import('./pages/Tracking');
    import('./pages/Payment');
    import('./pages/Notifications');
    import('./pages/Profile');
    import('./pages/CustomerSupport');
  }, []);

  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/driver-assignment" element={<ProtectedRoute roles={['admin']}><DriverAssignment /></ProtectedRoute>} />
            <Route path="/payments" element={<Payment />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/driver-portal" element={<ProtectedRoute roles={['driver']}><DriverPortal /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute roles={['admin']}><FleetManagement /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute roles={['admin']}><Drivers /></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute roles={['admin']}><WarehouseManagement /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={['admin']}><InventoryTracking /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
            <Route path="/support" element={<CustomerSupport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/qr-scan" element={<QRScan />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
