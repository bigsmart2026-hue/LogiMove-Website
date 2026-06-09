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
import { Mail, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
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
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </Typography>
        {/* <Divider sx={{ my: 2.5 }} /> */}
        {/* <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Shield size={14} /> Secured with Firebase Authentication
          </Typography>
          <Typography variant="caption" color="text.secondary">Register first if you don't have an account yet.</Typography>
        </Box> */}
      </Paper>
    </Box>
  );
}
