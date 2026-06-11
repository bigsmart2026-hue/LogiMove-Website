import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDrivers, subscribeToAllOrders, addDriver, assignDriver } from '../firebase/services';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import toast from 'react-hot-toast';
import { Package, CreditCard, Truck, Hourglass, UserPlus } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverOpen, setDriverOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleType: 'bike' });
  const [selectedOrder, setSelectedOrder] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers().then(setDrivers);
    const unsub = subscribeToAllOrders(setOrders);
    return unsub;
  }, []);

  const statusCounts = { pending: 0, 'picked-up': 0, 'in-transit': 0, delivered: 0, cancelled: 0 };
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.cost || 0), 0);
  const pendingRev = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.cost || 0), 0);
  const pendingOrders = orders.filter(o => !o.assignedDriver && o.status !== 'delivered' && o.status !== 'cancelled');

  const monthlyData = [
    { name: 'Jan', orders: 12, revenue: 180000 }, { name: 'Feb', orders: 19, revenue: 285000 },
    { name: 'Mar', orders: 15, revenue: 225000 }, { name: 'Apr', orders: 22, revenue: 330000 },
    { name: 'May', orders: 28, revenue: 420000 }, { name: 'Jun', orders: orders.length, revenue },
  ];

  const handleAddDriver = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const driver = await addDriver({
        name: form.name,
        email: form.email,
        phone: form.phone,
        vehicleType: form.vehicleType,
        status: 'available',
        rating: 5.0,
        totalDeliveries: 0,
        earnings: 0,
      });
      if (selectedOrder) {
        await assignDriver(selectedOrder, driver.id);
        toast.success(`Driver ${form.name} added and assigned to order`);
      } else {
        toast.success(`Driver ${form.name} added successfully`);
      }
      const updated = await fetchDrivers();
      setDrivers(updated);
      setDriverOpen(false);
      setForm({ name: '', email: '', phone: '', vehicleType: 'bike' });
      setSelectedOrder('');
    } catch (err) {
      toast.error('Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={() => setDriverOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Add Driver
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Total Orders" value={orders.length} icon={<Package size={22} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Revenue" value={`₦${revenue.toLocaleString()}`} icon={<CreditCard size={22} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Active Drivers" value={drivers.filter(d => d.status === 'on-delivery').length} icon={<Truck size={22} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Pending Revenue" value={`₦${pendingRev.toLocaleString()}`} icon={<Hourglass size={22} />} /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Revenue</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(0, 5).map(order => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.id?.slice(0, 8)}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell>₦{order.cost?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={order.paymentStatus} size="small" color={order.paymentStatus === 'paid' ? 'success' : 'warning'} variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Driver Dialog */}
      <Dialog open={driverOpen} onClose={() => setDriverOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Driver</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required fullWidth size="small" />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required fullWidth size="small" />
            <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Vehicle Type</InputLabel>
              <Select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))} label="Vehicle Type">
                <MenuItem value="bike">Bike</MenuItem>
                <MenuItem value="van">Van</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Assign Task (optional)</InputLabel>
              <Select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} label="Assign Task (optional)">
                <MenuItem value="">None — just add driver</MenuItem>
                {pendingOrders.map(o => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.id?.slice(0, 10)} — {o.customer || 'N/A'} ({o.origin?.split(',')[0]} → {o.destination?.split(',')[0]})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDriverOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddDriver} variant="contained" disabled={submitting} startIcon={<UserPlus size={18} />}>
            {submitting ? 'Adding...' : 'Add & Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
