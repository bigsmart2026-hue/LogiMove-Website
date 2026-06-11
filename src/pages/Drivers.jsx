import { useState, useEffect } from 'react';
import { fetchDrivers, fetchOrders, fetchVehicles, addDriver, assignDriver } from '../firebase/services';
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
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';
import { Users, UserCheck, Truck, Star, Plus, Bike, Phone, Mail, IdCard } from 'lucide-react';

const typeIcons = { bike: Bike, van: Truck, truck: Truck };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverOpen, setDriverOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleId: '', driverId: '' });
  const [selectedOrder, setSelectedOrder] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => Promise.all([fetchDrivers(), fetchOrders(), fetchVehicles()]).then(([d, o, v]) => { setDrivers(d); setOrders(o); setVehicles(v); });
  useEffect(() => { loadData(); }, []);

  const driverActiveDeliveries = (driverId) => orders.filter(o => o.assignedDriver === driverId && o.status !== 'delivered' && o.status !== 'cancelled').length;
  const avgRating = drivers.length ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1) : '0.0';
  const pendingOrders = orders.filter(o => !o.assignedDriver && o.status !== 'delivered' && o.status !== 'cancelled');

  const getVehicleForDriver = (driverId) => vehicles.find(v => v.driverId === driverId);

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
        vehicleId: form.vehicleId || '',
        driverId: form.driverId || '',
        status: 'available',
        rating: 5.0,
        totalDeliveries: 0,
        earnings: 0,
      });
      if (selectedOrder) {
        await assignDriver(selectedOrder, driver.id);
        toast.success(`Driver ${form.name} added and assigned an order`);
      } else {
        toast.success(`Driver ${form.name} added successfully`);
      }
      setDriverOpen(false);
      setForm({ name: '', email: '', phone: '', vehicleId: '', driverId: '' });
      setSelectedOrder('');
      loadData();
    } catch (err) {
      toast.error('Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Driver Management</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setDriverOpen(true)} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Add Driver
        </Button>
      </Box>

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
                <TableCell sx={{ fontWeight: 700 }}>Driver ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
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
              {drivers.map(driver => {
                const vehicle = getVehicleForDriver(driver.id);
                const TypeIcon = typeIcons[vehicle?.type] || Truck;
                return (
                  <TableRow key={driver.id} hover>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IdCard size={12} /> {driver.id?.slice(0, 10)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>{driver.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{driver.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {driver.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={12} /> {driver.phone}</Box>}
                        {driver.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={12} /> {driver.email}</Box>}
                        {!driver.phone && !driver.email && <Typography variant="caption" color="text.disabled">—</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {vehicle ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TypeIcon size={14} />
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{vehicle.type}</Typography>
                          <Typography variant="caption" color="text.disabled">({vehicle.plateNumber})</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Star size={14} color="#d97706" />{driver.rating}</Box></TableCell>
                    <TableCell>{driver.totalDeliveries}</TableCell>
                    <TableCell>{driverActiveDeliveries(driver.id)}</TableCell>
                    <TableCell>₦{driver.earnings?.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={driver.status === 'on-delivery' ? 'in-transit' : driver.status} /></TableCell>
                  </TableRow>
                );
              })}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
                    No drivers yet. Click "Add Driver" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Driver Dialog */}
      <Dialog open={driverOpen} onClose={() => setDriverOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCheck size={20} /> Add New Driver
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required fullWidth size="small" />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required fullWidth size="small" />
            <TextField label="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" placeholder="+234 800 000 0000" />
            <TextField label="Driver ID (optional)" value={form.driverId} onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))} fullWidth size="small" placeholder="e.g., DRV-001" />
            <FormControl fullWidth size="small">
              <InputLabel>Assign Vehicle (optional)</InputLabel>
              <Select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} label="Assign Vehicle (optional)">
                <MenuItem value="">No vehicle</MenuItem>
                {vehicles.filter(v => !v.driverId || v.driverId === '').map(v => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.plateNumber} ({v.type}) — {v.status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Assign Task (optional)</InputLabel>
              <Select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} label="Assign Task (optional)">
                <MenuItem value="">None</MenuItem>
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
          <Button onClick={handleAddDriver} variant="contained" disabled={submitting} startIcon={<UserCheck size={18} />}>
            {submitting ? 'Adding...' : 'Add Driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
