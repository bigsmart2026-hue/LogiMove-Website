import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { toggleTheme, mode } = useThemeMode();

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onMenuClick} sx={{ display: { lg: 'none' } }} edge="start" size="small">
            <Menu size={22} />
          </IconButton>
          <Typography variant="h6" sx={{ display: { lg: 'none' }, color: 'text.primary' }}>LogiMove</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Welcome, {user?.name}
          </Typography>
          <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }} title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>
          <Chip label={user?.role} size="small" color="primary" variant="outlined" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
          <Button color="error" size="small" startIcon={<LogOut size={16} />} onClick={logout} sx={{ fontWeight: 500 }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
