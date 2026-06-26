import { useState, useEffect } from 'react';
import { fetchDrivers, fetchOrders, fetchVehicles, addDriver, assignDriver } from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
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
import toast from 'react-hot-toast';
import { UserCheck, Truck, Star, Plus, Bike, Phone, Mail, IdCard } from 'lucide-react';

const typeIcons = { bike: Bike, van: Truck, truck: Truck };
const h = { fontWeight: 700 }, f = { display: 'flex', alignItems: 'center', gap: 0.5 };

export default function Drivers() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverOpen, setDriverOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleId: '', driverId: '' });
  const [selectedOrder, setSelectedOrder] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadData = () => Promise.all([fetchDrivers(), fetchOrders(), fetchVehicles()]).then(([d, o, v]) => { setDrivers(d); setOrders(o); setVehicles(v); });
  useEffect(() => { loadData(); }, []);

  const activeDeliveries = (id) => orders.filter(o => o.assignedDriver === id && o.status !== 'delivered' && o.status !== 'cancelled').length;
  const avgRating = drivers.length ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1) : '0.0';

  const getVehicle = (driverId) => vehicles.find(v => v.driverId === driverId);

  const handleAddDriver = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const d = await addDriver({
        name: form.name, email: form.email, phone: form.phone, vehicleId: form.vehicleId || '',
        driverId: form.driverId || '', status: 'available', rating: 5.0, totalDeliveries: 0, earnings: 0,
      });
      if (selectedOrder) {
        await assignDriver(selectedOrder, d.id);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Driver Management</Typography>
        <Button variant="contained" size="small" startIcon={<Plus size={14} />} onClick={() => setDriverOpen(true)} sx={{ fontSize: '0.75rem' }}>
          Add Driver
        </Button>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Drivers</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{drivers.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#10b981' }}>{drivers.filter(d => d.status === 'available').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>On Delivery</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: 'hsl(8, 85%, 55%)' }}>{drivers.filter(d => d.status === 'on-delivery').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Rating</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#f59e0b', ...f }}>{avgRating} <Star size={14} /></Typography></Paper></Grid>
      </Grid>

      <Paper sx={{ bgcolor: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" sx={{ fontSize: '0.75rem' }}>
            <TableHead>
              <TableRow sx={{ '& > th': { color: muted, fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${border}` } }}>
                <TableCell sx={h}>Driver ID</TableCell>
                <TableCell sx={h}>Name</TableCell>
                <TableCell sx={h}>Contact</TableCell>
                <TableCell sx={h}>Vehicle</TableCell>
                <TableCell sx={h}>Rating</TableCell>
                <TableCell sx={h}>Deliveries</TableCell>
                <TableCell sx={h}>Active</TableCell>
                <TableCell sx={h}>Earnings</TableCell>
                <TableCell sx={h}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map(d => {
                const vehicle = getVehicle(d.id);
                const TypeIcon = typeIcons[vehicle?.type] || Truck;
                return (
                  <TableRow key={d.id} hover>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      <Box sx={f}>
                        <IdCard size={12} /> {d.id?.slice(0, 10)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>{d.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {d.phone && <Box sx={f}><Phone size={12} /> {d.phone}</Box>}
                        {d.email && <Box sx={f}><Mail size={12} /> {d.email}</Box>}
                        {!d.phone && !d.email && <Typography variant="caption" color="text.disabled">—</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {vehicle ? (
                        <Box sx={f}>
                          <TypeIcon size={14} />
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{vehicle.type}</Typography>
                          <Typography variant="caption" color="text.disabled">({vehicle.plateNumber})</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell><Box sx={f}><Star size={14} color="#d97706" />{d.rating}</Box></TableCell>
                    <TableCell>{d.totalDeliveries}</TableCell>
                    <TableCell>{activeDeliveries(d.id)}</TableCell>
                    <TableCell>₦{d.earnings?.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={d.status === 'on-delivery' ? 'in-transit' : d.status} /></TableCell>
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

      <Dialog open={driverOpen} onClose={() => setDriverOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCheck size={18} /> Add New Driver
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={set('name')} required fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Phone Number" value={form.phone} onChange={set('phone')} fullWidth size="small" placeholder="+234 800 000 0000" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Driver ID (optional)" value={form.driverId} onChange={set('driverId')} fullWidth size="small" placeholder="e.g., DRV-001" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Assign Vehicle (optional)</InputLabel>
              <Select value={form.vehicleId} onChange={set('vehicleId')} label="Assign Vehicle (optional)"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                <MenuItem value="">No vehicle</MenuItem>
                {vehicles.filter(v => !v.driverId || v.driverId === '').map(v => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.plateNumber} ({v.type}) — {v.status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Assign Task (optional)</InputLabel>
              <Select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} label="Assign Task (optional)"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                <MenuItem value="">None</MenuItem>
                {orders.filter(o => !o.assignedDriver && o.status !== 'delivered' && o.status !== 'cancelled').map(o => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.id?.slice(0, 10)} — {o.customer || 'N/A'} ({o.origin?.split(',')[0]} → {o.destination?.split(',')[0]})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setDriverOpen(false)} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.75rem' }}>Cancel</Button>
          <Button onClick={handleAddDriver} variant="contained" disabled={submitting} startIcon={<UserCheck size={14} />} sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.75rem' }}>
            {submitting ? 'Adding...' : 'Add Driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
