import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email address'); return; }
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.message;
      setError(msg);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 440, borderRadius: 4 }} elevation={8}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800 }}>LogiMove</Typography>
          <Typography variant="body2" color="text.secondary">Reset your password</Typography>
        </Box>

        {sent ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}><CheckCircle size={48} color="#16a34a" /></Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Check your email</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              A password reset link has been sent to <strong>{email}</strong>
            </Typography>
            <Button component={Link} to="/login" variant="text" startIcon={<ArrowLeft size={18} />}>Back to Sign In</Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={20} /></InputAdornment> } }}
              fullWidth
            />
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <Button type="submit" variant="contained" size="large" startIcon={<Send size={20} />} fullWidth>Send Reset Link</Button>
          </Box>
        )}

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
