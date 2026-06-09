import { useState, useEffect } from 'react';
import { fetchDrivers, fetchOrders } from '../firebase/services';
import StatusBadge from '../components/StatusBadge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { Users, UserCheck, Truck, Star } from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => { Promise.all([fetchDrivers(), fetchOrders()]).then(([d, o]) => { setDrivers(d); setOrders(o); }); }, []);

  const driverActiveDeliveries = (driverId) => orders.filter(o => o.assignedDriver === driverId && o.status !== 'delivered' && o.status !== 'cancelled').length;
  const avgRating = drivers.length ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1) : '0.0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Driver Management</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Total Drivers</Typography><Typography variant="h4">{drivers.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Available</Typography><Typography variant="h4" sx={{ color: 'success.main' }}>{drivers.filter(d => d.status === 'available').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>On Delivery</Typography><Typography variant="h4" sx={{ color: 'primary.main' }}>{drivers.filter(d => d.status === 'on-delivery').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Avg Rating</Typography><Typography variant="h4" sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>{avgRating} <Star size={20} /></Typography></Paper></Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Deliveries</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Earnings</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map(driver => (
                <TableRow key={driver.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>{driver.name?.charAt(0)}</Avatar>
                      <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{driver.name}</Typography><Typography variant="caption" color="text.secondary">{driver.id?.slice(0, 8)}</Typography></Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{driver.phone}<br />{driver.email}</TableCell>
                  <TableCell>{driver.vehicleId || '—'}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Star size={14} color="#d97706" />{driver.rating}</Box></TableCell>
                  <TableCell>{driver.totalDeliveries}</TableCell>
                  <TableCell>{driverActiveDeliveries(driver.id)}</TableCell>
                  <TableCell>₦{driver.earnings?.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={driver.status === 'on-delivery' ? 'in-transit' : driver.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
