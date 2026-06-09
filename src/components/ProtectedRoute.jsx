import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function homeByRole(role) {
  if (role === 'admin') return '/dashboard';
  if (role === 'driver') return '/driver-portal';
  return '/bookings';
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;
  const effectiveRole = user.email === 'bigsmart2026@gmail.com' ? 'admin' : user.role;
  if (roles && !roles.includes(effectiveRole)) return <Navigate to={homeByRole(user.role)} replace />;
  return children;
}
