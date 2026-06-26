import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import toast from 'react-hot-toast';
import { Menu, LogOut, Sun, Moon, Bell, Search, User, Camera, Save } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { toggleTheme, mode } = useThemeMode();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const [profileOpen, setProfileOpen] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const handleSaveProfile = async () => {
    try {
      const { updateUserProfile, addActivityLog } = await import('../firebase/services');
      await updateUserProfile(user.userId, { nickname, avatarUrl });
      await addActivityLog('Profile updated from navbar');
      toast.success('Profile updated');
      setProfileOpen(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
    }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 48, md: 52 }, px: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={onMenuClick} sx={{ color: isDark ? '#94a3b8' : '#64748b' }} edge="start" size="small">
            <Menu size={20} />
          </IconButton>
          <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.7rem', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
            Welcome, <span style={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 700 }}>{user?.name?.split(' ')[0] || 'User'}</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 1.5, py: 0.4,
            borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            <Search size={13} />
            <input
              placeholder="Search orders, drivers..."
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const q = e.target.value.trim();
                  try {
                    const { fetchOrders, fetchDrivers } = await import('../firebase/services');
                    const [orders, drivers] = await Promise.all([fetchOrders(), fetchDrivers()]);
                    const order = orders.find(o => o.id?.includes(q) || o.customer?.toLowerCase().includes(q.toLowerCase()));
                    const driver = drivers.find(d => d.name?.toLowerCase().includes(q.toLowerCase()));
                    if (order) navigate('/tracking');
                    else if (driver) navigate('/fleet');
                    else toast.error('No results found');
                  } catch { toast.error('Search failed'); }
                  e.target.value = '';
                }
              }}
              style={{
                background: 'transparent', border: 'none', outline: 'none', color: 'inherit',
                fontSize: '0.7rem', width: 140, fontFamily: 'inherit',
              }}
            />
            <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.5, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', fontSize: '0.5rem', color: 'inherit' }}>
              ⌘K
            </Box>
          </Box>

          <IconButton size="small" onClick={() => navigate('/notifications')} sx={{ color: isDark ? '#94a3b8' : '#64748b', position: 'relative' }}>
            <Bell size={16} />
            <Box sx={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', bgcolor: '#ef4444' }} />
          </IconButton>

          <IconButton onClick={toggleTheme} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }} title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            {mode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </IconButton>

          <Chip label={user?.role} size="small" sx={{
            textTransform: 'capitalize', fontWeight: 600, fontSize: '0.55rem', height: 20,
            bgcolor: isDark ? 'hsla(8, 85%, 55%, 0.15)' : 'hsla(8, 85%, 55%, 0.1)',
            color: 'hsl(8, 85%, 55%)', border: 'none',
          }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 0.3, cursor: 'pointer' }} onClick={() => setProfileOpen(true)}>
            <Avatar src={user?.avatarUrl || avatarUrl} sx={{ width: 26, height: 26, bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.6rem', fontWeight: 700 }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, color: isDark ? '#e2e8f0' : '#0f172a', fontWeight: 500, fontSize: '0.7rem' }}>
              {user?.nickname || user?.name}
            </Typography>
          </Box>

          <IconButton onClick={logout} size="small" sx={{ color: isDark ? '#475569' : '#94a3b8', ml: 0.3 }}>
            <LogOut size={15} />
          </IconButton>
        </Box>
      </Toolbar>

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? '#111827' : '#fff', color: isDark ? '#f3f4f6' : '#0f172a', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <User size={16} /> Edit Profile
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: isDark ? '#1f2937' : '#e2e8f0' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar src={avatarUrl || user?.avatarUrl} sx={{ width: 64, height: 64, bgcolor: 'hsl(8, 85%, 55%)', fontSize: '1.2rem', fontWeight: 700, mx: 'auto' }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <label htmlFor="avatar-upload">
                  <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'hsl(8, 85%, 55%)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Camera size={12} color="white" />
                  </Box>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
              </Box>
            </Box>
            <TextField label="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} fullWidth size="small"
              sx={{ '& .MuiInputLabel-root': { color: isDark ? '#6b7280' : '#64748b' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#1f2937' : '#e2e8f0' }, '& .MuiInputBase-input': { color: isDark ? '#f3f4f6' : '#0f172a' } }} />
            <TextField label="Name" defaultValue={user?.name} disabled fullWidth size="small"
              sx={{ '& .MuiInputLabel-root': { color: isDark ? '#6b7280' : '#64748b' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#1f2937' : '#e2e8f0' }, '& .MuiInputBase-input': { color: isDark ? '#6b7280' : '#64748b' } }} />
            <TextField label="Email" defaultValue={user?.email} disabled fullWidth size="small"
              sx={{ '& .MuiInputLabel-root': { color: isDark ? '#6b7280' : '#64748b' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#1f2937' : '#e2e8f0' }, '& .MuiInputBase-input': { color: isDark ? '#6b7280' : '#64748b' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, px: 3, pb: 2 }}>
          <Button onClick={() => setProfileOpen(false)} variant="outlined" sx={{ borderColor: isDark ? '#1f2937' : '#e2e8f0', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.7rem' }}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" size="small" startIcon={<Save size={13} />} sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.7rem' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
