import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchWarehouses, addWarehouse, addActivityLog } from '../firebase/services';
import MapContainer from '../components/MapContainer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { Plus, X, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newWh, setNewWh] = useState({ name: '', location: '', capacity: '', manager: '' });

  const loadData = () => fetchWarehouses().then(setWarehouses);
  useEffect(() => { loadData(); }, []);

  const handleAddWarehouse = async () => {
    if (!newWh.name || !newWh.location) { toast.error('Fill required fields'); return; }
    await addWarehouse({ ...newWh, capacity: Number(newWh.capacity) || 1000 });
    await addActivityLog(`Added warehouse ${newWh.name}`);
    toast.success(`Warehouse ${newWh.name} added`);
    setNewWh({ name: '', location: '', capacity: '', manager: '' });
    setShowForm(false);
    loadData();
  };

  const mapMarkers = warehouses.map(w => ({ lat: w.lat, lng: w.lng, label: w.name.split(' ').slice(0, 2).join(' '), color: 'blue' }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Warehouse Management</Typography>
        <Button variant="contained" startIcon={showForm ? <X size={18} /> : <Plus size={18} />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Warehouse'}
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 2.5 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" placeholder="Warehouse Name" value={newWh.name} onChange={e => setNewWh(f => ({ ...f, name: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" placeholder="Location" value={newWh.location} onChange={e => setNewWh(f => ({ ...f, location: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" placeholder="Capacity" type="number" value={newWh.capacity} onChange={e => setNewWh(f => ({ ...f, capacity: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" placeholder="Manager" value={newWh.manager} onChange={e => setNewWh(f => ({ ...f, manager: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><Button variant="contained" color="success" fullWidth size="medium" onClick={handleAddWarehouse}>Save</Button></Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}><MapPin size={16} /> Warehouse Map</Typography>
            <MapContainer center={[7.5, 5.0]} zoom={6} markers={mapMarkers} className="h-80 w-full rounded-lg" />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {warehouses.map(wh => (
              <Paper key={wh.id} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WarehouseIcon size={16} /> {wh.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{wh.location}</Typography>
                  </Box>
                  <Chip label={wh.id?.slice(0, 8)} size="small" variant="outlined" />
                </Box>
                <Grid container spacing={2} sx={{ mb: 1.5 }}>
                  <Grid size={4}><Typography variant="caption" color="text.secondary">Capacity</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{wh.currentStock?.toLocaleString()} / {wh.capacity?.toLocaleString()} kg</Typography></Grid>
                  <Grid size={4}><Typography variant="caption" color="text.secondary">Usage</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{Math.round((wh.currentStock / wh.capacity) * 100)}%</Typography></Grid>
                  <Grid size={4}><Typography variant="caption" color="text.secondary">Manager</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{wh.manager}</Typography></Grid>
                </Grid>
                <LinearProgress variant="determinate" value={(wh.currentStock / wh.capacity) * 100} sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }} />
              </Paper>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
