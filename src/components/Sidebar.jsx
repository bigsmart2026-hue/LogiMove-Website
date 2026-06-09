import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { X, LayoutDashboard, Package, MapPin, Users, CreditCard, Bell, Truck, UserRound, Warehouse, ClipboardList, BarChart3, MessageSquare, Navigation } from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: Package },
  { to: '/tracking', label: 'Tracking', icon: MapPin },
  { to: '/driver-assignment', label: 'Assign Drivers', icon: Users },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: UserRound },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { to: '/inventory', label: 'Inventory', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

const customerLinks = [
  { to: '/bookings', label: 'New Booking', icon: Package },
  { to: '/tracking', label: 'Track Package', icon: MapPin },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

const driverLinks = [
  { to: '/driver-portal', label: 'My Deliveries', icon: Package },
  { to: '/tracking', label: 'Navigation', icon: Navigation },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'driver' ? driverLinks : customerLinks;

  const drawerContent = (
    <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/')}>
          LogiMove
        </Typography>
        <IconButton onClick={onClose} sx={{ display: { lg: 'none' } }} size="small">
          <X size={20} />
        </IconButton>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto', px: 1.5, py: 1 }}>
        {links.map(link => {
          const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
          const Icon = link.icon;
          return (
            <ListItemButton
              key={link.to}
              onClick={() => { navigate(link.to); onClose(); }}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'text.secondary' }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">LogiMove v1.0</Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: 260 } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'relative',
          flexShrink: 0,
          width: 260,
          '& .MuiDrawer-paper': { width: 260, position: 'relative', borderRight: '1px solid', borderColor: 'divider' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
