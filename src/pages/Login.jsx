import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.email === 'bigsmart2026@gmail.com' || user.role === 'admin') navigate('/dashboard', { replace: true });
    else if (user.role === 'driver') navigate('/driver-portal', { replace: true });
    else navigate('/bookings', { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      await login(email, password);
    } catch (err) { setError(err.message); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await googleLogin();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 440, borderRadius: 4 }} elevation={8}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800 }}>LogiMove</Typography>
          <Typography variant="body2" color="text.secondary">Logistics Platform</Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 3 }}>Sign in to your account</Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={20} /></InputAdornment> } }}
            fullWidth
          />
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock size={20} /></InputAdornment>,
                endAdornment: <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw(p => !p)} edge="end" size="small">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>,
              },
            }}
            fullWidth
          />
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none' }}>Forgot password?</Link>
          </Box>
          <Button type="submit" variant="contained" size="large" startIcon={<LogIn size={20} />} fullWidth>Sign In</Button>
        </Box>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" color="text.secondary">OR</Typography>
        </Divider>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          startIcon={
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          }
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
