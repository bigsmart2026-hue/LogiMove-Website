import { useState, useEffect, useMemo } from 'react';
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
import LinearProgress from '@mui/material/LinearProgress';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'grey.300' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { score: 25, label: 'Weak', color: 'error.main' };
  if (score <= 3) return { score: 50, label: 'Fair', color: 'warning.main' };
  if (score <= 4) return { score: 75, label: 'Good', color: 'info.main' };
  return { score: 100, label: 'Strong', color: 'success.main' };
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (!user) return;
    if (user.email === 'bigsmart2026@gmail.com' || user.role === 'admin') navigate('/dashboard', { replace: true });
    else if (user.role === 'driver') navigate('/driver-portal', { replace: true });
    else navigate('/bookings', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (strength.label === 'Weak' && password.length >= 6) {
      setError('Password is too weak. Add uppercase, numbers, or symbols.');
      return;
    }
    try {
      await register(name, email, password);
    } catch (err) { setError(err.message || 'Registration failed'); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 440, borderRadius: 4 }} elevation={8}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800 }}>LogiMove</Typography>
          <Typography variant="body2" color="text.secondary">Create your account</Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 3 }}>Create your account</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={20} /></InputAdornment> } }}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={20} /></InputAdornment> } }}
            fullWidth
          />
          <Box>
            <TextField
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
            {password && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 3, transition: 'all 0.3s' },
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: strength.color, minWidth: 40, textAlign: 'right' }}>
                    {strength.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                  {[
                    { label: '6+ chars', met: password.length >= 6 },
                    { label: 'Uppercase', met: /[A-Z]/.test(password) },
                    { label: 'Number', met: /[0-9]/.test(password) },
                    { label: 'Symbol', met: /[^a-zA-Z0-9]/.test(password) },
                  ].map(c => (
                    <Typography key={c.label} variant="caption" sx={{ color: c.met ? 'success.main' : 'text.disabled', fontWeight: 500 }}>
                      {c.met ? '✓' : '○'} {c.label}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" size="large" startIcon={<UserPlus size={20} />} fullWidth sx={{ mt: 1 }}>Create Account</Button>
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
