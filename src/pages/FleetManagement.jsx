import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchVehicles, fetchDrivers, addVehicle, updateVehicle, addActivityLog } from '../firebase/services';
import MapContainer from '../components/MapContainer';
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import { Truck, Fuel, Wrench, Plus, X, Map, Bike, Warehouse } from 'lucide-react';

const vehicleTypes = ['bike', 'van', 'truck'];
const typeIcons = { bike: Bike, van: Truck, truck: Warehouse };

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', type: 'van', capacity: '', driverId: '' });
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicleId: '', date: '', type: '' });

  const loadData = () => Promise.all([fetchVehicles(), fetchDrivers()]).then(([v, d]) => { setVehicles(v); setDrivers(d); });
  useEffect(() => { loadData(); }, []);

  const addNewVehicle = async () => {
    if (!newVehicle.plateNumber || !newVehicle.type) { toast.error('Fill required fields'); return; }
    await addVehicle({ ...newVehicle, capacity: Number(newVehicle.capacity) || 500 });
    await addActivityLog(`Added vehicle ${newVehicle.plateNumber}`);
    toast.success('Vehicle added');
    setShowForm(false);
    setNewVehicle({ plateNumber: '', type: 'van', capacity: '', driverId: '' });
    loadData();
  };

  const toggleAvailability = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateVehicle(id, { status: newStatus });
    await addActivityLog(`Vehicle ${id} toggled to ${newStatus}`);
    toast.success(`Vehicle ${id} ${newStatus}`);
    loadData();
  };

  const logFuel = async () => {
    if (!fuelForm.vehicleId || !fuelForm.amount) { toast.error('Fill all fields'); return; }
    const vehicle = vehicles.find(v => v.id === fuelForm.vehicleId);
    await updateVehicle(fuelForm.vehicleId, { fuelLevel: Math.max(0, (vehicle?.fuelLevel || 100) - Number(fuelForm.amount) / 5) });
    await addActivityLog(`Fuel logged: ${fuelForm.vehicleId} - ${fuelForm.amount}L`);
    toast.success(`Fuel logged: ${fuelForm.vehicleId}`);
    setFuelForm({ vehicleId: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    loadData();
  };

  const scheduleMaintenance = async () => {
    if (!maintenanceForm.vehicleId || !maintenanceForm.date) { toast.error('Fill all fields'); return; }
    await updateVehicle(maintenanceForm.vehicleId, { status: 'maintenance' });
    await addActivityLog(`Maintenance scheduled for ${maintenanceForm.vehicleId} on ${maintenanceForm.date}`);
    toast.success(`Maintenance scheduled for ${maintenanceForm.vehicleId}`);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Maintenance Reminder: ${maintenanceForm.vehicleId} on ${maintenanceForm.date}`);
    }
    setMaintenanceForm({ vehicleId: '', date: '', type: '' });
    loadData();
  };

  const requestNotifPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  };

  const mapMarkers = vehicles.filter(v => v.location).map(v => ({ lat: v.location.lat, lng: v.location.lng, label: `${v.plateNumber} (${v.type})`, color: v.status === 'active' ? 'blue' : 'red' }));

  const vehicleEmissions = { bike: 0.05, van: 0.2, truck: 0.4 };
  const totalCarbon = vehicles.reduce((s, v) => s + (vehicleEmissions[v.type] || 0) * 100, 0);

  const statusChipColor = (s) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'default';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Fleet Management</Typography>
        <Button size="small" variant="outlined" onClick={requestNotifPermission}>Enable Notifications</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">Total Vehicles</Typography><Typography variant="h4">{vehicles.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">Active</Typography><Typography variant="h4" sx={{ color: 'success.main' }}>{vehicles.filter(v => v.status === 'active').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">In Maintenance</Typography><Typography variant="h4" sx={{ color: 'warning.main' }}>{vehicles.filter(v => v.status === 'maintenance').length}</Typography></Paper></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">CO₂ (est.)</Typography><Typography variant="h4">{totalCarbon.toFixed(1)} kg</Typography></Paper></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 1.5 }}>
            <MapContainer center={[7.5, 5.0]} zoom={6} markers={mapMarkers} className="h-64 w-full rounded-lg" />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Fuel size={18} /> Log Fuel Consumption
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select fullWidth size="small" value={fuelForm.vehicleId} onChange={e => setFuelForm(f => ({ ...f, vehicleId: e.target.value }))}>
                    <MenuItem value="">Select Vehicle</MenuItem>
                    {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.plateNumber}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth size="small" type="number" value={fuelForm.amount} onChange={e => setFuelForm(f => ({ ...f, amount: e.target.value }))} placeholder="Litres" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button variant="contained" fullWidth size="small" onClick={logFuel}>Log Fuel</Button>
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Wrench size={18} /> Schedule Maintenance
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select fullWidth size="small" value={maintenanceForm.vehicleId} onChange={e => setMaintenanceForm(f => ({ ...f, vehicleId: e.target.value }))}>
                    <MenuItem value="">Select Vehicle</MenuItem>
                    {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.plateNumber}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth size="small" type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm(f => ({ ...f, date: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button variant="contained" color="warning" fullWidth size="small" onClick={scheduleMaintenance}>Schedule</Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Vehicle List</Typography>
          <Button size="small" variant="contained" startIcon={showForm ? <X size={16} /> : <Plus size={16} />} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Vehicle'}
          </Button>
        </Box>
        {showForm && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth size="small" placeholder="Plate Number" value={newVehicle.plateNumber} onChange={e => setNewVehicle(f => ({ ...f, plateNumber: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField select fullWidth size="small" value={newVehicle.type} onChange={e => setNewVehicle(f => ({ ...f, type: e.target.value }))}>
                  {vehicleTypes.map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField fullWidth size="small" placeholder="Capacity (kg)" type="number" value={newVehicle.capacity} onChange={e => setNewVehicle(f => ({ ...f, capacity: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth size="small" placeholder="Driver ID" value={newVehicle.driverId} onChange={e => setNewVehicle(f => ({ ...f, driverId: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button variant="contained" color="success" fullWidth size="small" onClick={addNewVehicle}>Save</Button>
              </Grid>
            </Grid>
          </Box>
        )}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fuel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Battery</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map(v => {
                const driver = drivers.find(d => d.id === v.driverId);
                const TypeIcon = typeIcons[v.type] || Truck;
                return (
                  <TableRow key={v.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{v.plateNumber}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'capitalize' }}>
                      <TypeIcon size={16} /> {v.type}
                    </TableCell>
                    <TableCell>{driver?.name || '—'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 64 }}>
                          <LinearProgress variant="determinate" value={v.fuelLevel || 0} sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: (v.fuelLevel || 0) > 50 ? 'success.main' : (v.fuelLevel || 0) > 20 ? 'warning.main' : 'error.main', borderRadius: 4 } }} />
                        </Box>
                        <Typography variant="caption">{v.fuelLevel || 0}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{v.batteryLevel != null ? `${v.batteryLevel}%` : '—'}</TableCell>
                    <TableCell>
                      <Chip label={v.status} size="small" color={statusChipColor(v.status)} variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => toggleAvailability(v.id, v.status)}>Toggle</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
