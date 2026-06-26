import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { fetchOrders, fetchNotifications, updateOrder, addActivityLog } from '../firebase/services';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import { Bell, Package, CreditCard, Truck, RefreshCw, CheckCheck } from 'lucide-react';

const typeIcons = { status_update: Package, payment: CreditCard, default: Truck };

export default function Notifications() {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchNotifications()]).then(([o, n]) => {
      setOrders(o);
      const notifs = n.map(notif => ({
        id: notif.id,
        type: notif.type || 'status_update',
        message: notif.message,
        orderId: notif.orderId,
        timestamp: notif.createdAt,
        read: notif.read || false,
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (notifs.length === 0) {
        const generated = o.flatMap(order => (order.trackingHistory || []).map(h => ({
          id: `n-${order.id}-${h.timestamp}`,
          type: 'status_update',
          message: `Order ${order.id} is now ${h.status}`,
          orderId: order.id,
          timestamp: h.timestamp,
          read: false,
        }))).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(generated);
      } else {
        setNotifications(notifs);
      }
    });
  }, []);

  const statusFlow = ['pending', 'picked-up', 'in-transit', 'delivered'];

  const simulateUpdate = async () => {
    const order = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');
    if (!order) { toast.error('No active orders to update'); return; }
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx < statusFlow.length - 1) {
      const newStatus = statusFlow[currentIdx + 1];
      await updateOrder(order.id, { status: newStatus, trackingHistory: [...(order.trackingHistory || []), { status: newStatus, timestamp: new Date().toISOString() }] });
      await addActivityLog(`Order ${order.id} status changed to ${newStatus}`);
      toast.success(`${order.id}: Status changed to ${newStatus}`);
      const [o2] = await Promise.all([fetchOrders(), fetchNotifications()]);
      setOrders(o2);
    } else {
      toast('Order already delivered!');
    }
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unread = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Notifications</Typography>
          {unread > 0 && <Badge badgeContent={unread} color="primary" />}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user?.role === 'admin' && (
            <Button variant="contained" startIcon={<RefreshCw size={14} />} onClick={simulateUpdate} size="small" sx={{ fontSize: '0.75rem' }}>Simulate Update</Button>
          )}
          <Button variant="outlined" startIcon={<CheckCheck size={14} />} onClick={markAllRead} size="small" sx={{ fontSize: '0.75rem' }}>Mark All Read</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {notifications.map(n => {
          const Icon = typeIcons[n.type] || typeIcons.default;
          return (
            <Paper
              key={n.id}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: n.read ? border : 'hsl(8, 85%, 55%)',
                bgcolor: n.read ? bg : (isDark ? '#1a1f2e' : '#f0f5ff'),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                borderRadius: 2,
              }}
            >
              <Box sx={{ color: n.read ? muted : 'hsl(8, 85%, 55%)', mt: 0.2 }}>
                <Icon size={16} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600, color: text, fontSize: '0.75rem' }}>
                    {n.message}
                  </Typography>
                  {!n.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'hsl(8, 85%, 55%)', flexShrink: 0 }} />}
                </Box>
                <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem' }}>{new Date(n.timestamp).toLocaleString()}</Typography>
              </Box>
            </Paper>
          );
        })}
        {notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Bell size={32} style={{ margin: '0 auto', color: muted }} />
            <Typography variant="body2" sx={{ color: muted, mt: 1, fontSize: '0.75rem' }}>No notifications</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
