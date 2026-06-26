import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchOrders } from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { Download, Package, CheckCircle, Truck, DollarSign } from 'lucide-react';

export default function Reports() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders().then(setOrders); }, []);

  const handleExport = () => {
    const headers = 'Order ID,Customer,Origin,Destination,Status,Amount,Payment Status,Date\n';
    const rows = orders.map(o => `${o.id},${o.customer},${o.origin},${o.destination},${o.status},${o.cost},${o.paymentStatus},${o.createdAt}`).join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logimove-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV');
  };

  const completed = orders.filter(o => o.status === 'delivered').length;
  const inTransit = orders.filter(o => o.status === 'in-transit').length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.cost, 0);
  const total = orders.length || 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Reports</Typography>
        <Button variant="contained" size="small" startIcon={<Download size={14} />} onClick={handleExport} sx={{ fontSize: '0.75rem' }}>Export CSV</Button>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{orders.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#10b981' }}>{completed}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Transit</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#8b5cf6' }}>{inTransit}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: 'hsl(8, 85%, 55%)' }}>₦{totalRevenue.toLocaleString()}</Typography></Paper></Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
            <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}><Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.75rem' }}>Pending</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{pending}</Typography></Box><LinearProgress variant="determinate" value={(pending / total) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: border, '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 2 } }} /></Box>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}><Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.75rem' }}>In Transit</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{inTransit}</Typography></Box><LinearProgress variant="determinate" value={(inTransit / total) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: border, '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6', borderRadius: 2 } }} /></Box>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}><Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.75rem' }}>Delivered</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{completed}</Typography></Box><LinearProgress variant="determinate" value={(completed / total) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: border, '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 } }} /></Box>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
            <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Revenue Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${border}`, pb: 0.8 }}>
                <Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.7rem' }}>Card Payments</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.7rem' }}>₦{orders.filter(o => o.paymentMethod === 'card' && o.paymentStatus === 'paid').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${border}`, pb: 0.8 }}>
                <Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.7rem' }}>Cash on Delivery</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.7rem' }}>₦{orders.filter(o => o.paymentMethod === 'cash' && o.paymentStatus === 'paid').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${border}`, pb: 0.8 }}>
                <Typography variant="body2" sx={{ color: isDark ? '#d1d5db' : '#64748b', fontSize: '0.7rem' }}>Pending</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.7rem' }}>₦{orders.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: text, fontSize: '0.75rem' }}>Total</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'hsl(8, 85%, 55%)', fontSize: '0.75rem' }}>₦{totalRevenue.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Activity Log</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.flatMap(o => (o.trackingHistory || []).map(h => ({ ...h, orderId: o.id, cost: o.cost })))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 15)
                .map((entry, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{entry.orderId?.slice(0, 8)}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{entry.status}</TableCell>
                    <TableCell>{entry.cost ? `₦${entry.cost?.toLocaleString()}` : '—'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
