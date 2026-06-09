import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchOrders } from '../firebase/services';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Reports</Typography>
        <Button variant="contained" startIcon={<Download size={18} />} onClick={handleExport}>Export CSV</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Total Orders</Typography><Typography variant="h4">{orders.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Completed</Typography><Typography variant="h4" sx={{ color: 'success.main' }}>{completed}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>In Transit</Typography><Typography variant="h4" sx={{ color: 'secondary.main' }}>{inTransit}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Revenue</Typography><Typography variant="h4" sx={{ color: 'primary.main' }}>₦{totalRevenue.toLocaleString()}</Typography></Paper></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2">Pending</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{pending}</Typography></Box><LinearProgress variant="determinate" value={(pending / total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'warning.main', borderRadius: 4 } }} /></Box>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2">In Transit</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{inTransit}</Typography></Box><LinearProgress variant="determinate" value={(inTransit / total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main', borderRadius: 4 } }} /></Box>
              <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2">Delivered</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{completed}</Typography></Box><LinearProgress variant="determinate" value={(completed / total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 } }} /></Box>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Revenue Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="body2">Card Payments</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₦{orders.filter(o => o.paymentMethod === 'card' && o.paymentStatus === 'paid').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="body2">Cash on Delivery</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₦{orders.filter(o => o.paymentMethod === 'cash' && o.paymentStatus === 'paid').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="body2">Pending</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>₦{orders.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + o.cost, 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>₦{totalRevenue.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Activity Log</Typography>
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
