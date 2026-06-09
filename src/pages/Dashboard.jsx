import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDrivers, subscribeToAllOrders } from '../firebase/services';
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
import { Package, CreditCard, Truck, Hourglass } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers().then(setDrivers);
    const unsub = subscribeToAllOrders(setOrders);
    return unsub;
  }, []);

  const statusCounts = { pending: 0, 'picked-up': 0, 'in-transit': 0, delivered: 0, cancelled: 0 };
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.cost, 0);
  const pendingRev = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + o.cost, 0);

  const monthlyData = [
    { name: 'Jan', orders: 12, revenue: 180000 }, { name: 'Feb', orders: 19, revenue: 285000 },
    { name: 'Mar', orders: 15, revenue: 225000 }, { name: 'Apr', orders: 22, revenue: 330000 },
    { name: 'May', orders: 28, revenue: 420000 }, { name: 'Jun', orders: orders.length, revenue },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Dashboard</Typography>

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
    </Box>
  );
}
