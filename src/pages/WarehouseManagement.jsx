import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchWarehouses, addWarehouse, fetchInventory, updateInventoryItem, addActivityLog } from '../firebase/services';
import MapLibreMap from '../components/MapLibreMap';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { Plus, X, Warehouse as WarehouseIcon, MapPin, Phone, Mail, User, Package, AlertTriangle } from 'lucide-react';
import { useThemeMode } from '../context/ThemeContext';

export default function WarehouseManagement() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';

  const [tab, setTab] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newWh, setNewWh] = useState({ name: '', location: '', capacity: '', manager: '', managerEmail: '', managerPhone: '' });

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadWh = () => fetchWarehouses().then(setWarehouses);
  const loadInv = () => fetchInventory().then(setItems);
  useEffect(() => { loadWh(); loadInv(); }, []);

  const handleAddWarehouse = async () => {
    if (!newWh.name || !newWh.location) { toast.error('Fill required fields'); return; }
    await addWarehouse({ ...newWh, capacity: Number(newWh.capacity) || 1000 });
    await addActivityLog(`Added warehouse ${newWh.name}`);
    toast.success(`Warehouse ${newWh.name} added`);
    setNewWh({ name: '', location: '', capacity: '', manager: '', managerEmail: '', managerPhone: '' });
    setShowForm(false);
    loadWh();
  };

  const mapMarkers = warehouses.map(w => ({ lat: w.lat, lng: w.lng, label: w.name.split(' ').slice(0, 2).join(' '), color: 'blue' }));

  const filteredItems = filter === 'low' ? items.filter(i => i.quantity <= i.minStock) : items;
  const lowStockItems = items.filter(i => i.quantity <= i.minStock);

  const restock = async (item) => {
    await updateInventoryItem(item.id, { quantity: (item.quantity || 0) + 10 });
    await addActivityLog(`Restocked ${item.name} +10`);
    toast.success(`${item.name}: Stock updated`);
    loadInv();
  };

  const Txt = (c) => ({ color: text, ...c });
  const Muted = (c) => ({ color: muted, ...c });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Warehouse & Inventory</Typography>
        <Button variant="contained" size="small" startIcon={showForm ? <X size={14} /> : <Plus size={14} />} onClick={() => setShowForm(!showForm)} sx={{ fontSize: '0.75rem' }}>
          {showForm ? 'Cancel' : 'Add Warehouse'}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: border, '& .MuiTab-root': { color: muted, fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', minHeight: 36, '&.Mui-selected': { color: 'hsl(8, 85%, 55%)' } }, '& .MuiTabs-indicator': { bgcolor: 'hsl(8, 85%, 55%)' } }}>
        <Tab label="Warehouses" />
        <Tab label={`Inventory (${items.length})`} />
      </Tabs>

      {tab === 0 && (
        <>
          {showForm && (
            <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Warehouse Name" value={newWh.name} onChange={e => setNewWh(f => ({ ...f, name: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Location" value={newWh.location} onChange={e => setNewWh(f => ({ ...f, location: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
                <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Capacity (kg)" type="number" value={newWh.capacity} onChange={e => setNewWh(f => ({ ...f, capacity: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
                <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Manager Name" value={newWh.manager} onChange={e => setNewWh(f => ({ ...f, manager: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
                <Grid size={{ xs: 12, sm: 2 }}><Button variant="contained" color="success" fullWidth size="small" onClick={handleAddWarehouse} sx={{ fontSize: '0.75rem' }}>Save</Button></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Manager Email" type="email" value={newWh.managerEmail} onChange={e => setNewWh(f => ({ ...f, managerEmail: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Manager Phone" value={newWh.managerPhone} onChange={e => setNewWh(f => ({ ...f, managerPhone: e.target.value }))} sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} /></Grid>
              </Grid>
            </Paper>
          )}

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 1.5, bgcolor: bg, border: `1px solid ${border}` }}>
                <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPin size={14} /> Warehouse Map
                </Typography>
                <MapLibreMap center={[7.5, 5.0]} zoom={6} markers={mapMarkers} className="h-64 w-full rounded-lg" />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {warehouses.map(wh => (
                  <Paper key={wh.id} sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}>
                          <WarehouseIcon size={14} /> {wh.name}
                        </Typography>
                        <Typography variant="caption" color={muted} sx={{ fontSize: '0.65rem' }}>{wh.location}</Typography>
                      </Box>
                      <Chip label={wh.id?.slice(0, 8)} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20, borderColor: border, color: muted }} />
                    </Box>
                    <Grid container spacing={1.5} sx={{ mb: 1 }}>
                      <Grid size={4}><Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>Capacity</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{wh.currentStock?.toLocaleString()} / {wh.capacity?.toLocaleString()} kg</Typography></Grid>
                      <Grid size={4}><Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>Usage</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{Math.round((wh.currentStock / wh.capacity) * 100)}%</Typography></Grid>
                      <Grid size={4}><Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>Manager</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{wh.manager || '—'}</Typography></Grid>
                    </Grid>
                    {(wh.managerEmail || wh.managerPhone) && (
                      <Grid container spacing={1} sx={{ mb: 0.5 }}>
                        {wh.managerEmail && <Grid size={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={10} /><Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>{wh.managerEmail}</Typography></Box></Grid>}
                        {wh.managerPhone && <Grid size={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={10} /><Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>{wh.managerPhone}</Typography></Box></Grid>}
                      </Grid>
                    )}
                    <LinearProgress variant="determinate" value={(wh.currentStock / wh.capacity) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? '#1f2937' : '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: 'hsl(8, 85%, 55%)', borderRadius: 2 } }} />
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      {tab === 1 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
              <ToggleButton value="all" sx={{ fontSize: '0.7rem', color: muted }}>All ({items.length})</ToggleButton>
              <ToggleButton value="low" sx={{ fontSize: '0.7rem', color: muted }}>Low Stock ({lowStockItems.length})</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" color={muted} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Items</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{items.length}</Typography></Paper></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" color={muted} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Quantity</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</Typography></Paper></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" color={muted} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Alerts</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#ef4444' }}>{lowStockItems.length}</Typography></Paper></Grid>
          </Grid>

          <Paper sx={{ bgcolor: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small" sx={{ fontSize: '0.75rem' }}>
                <TableHead>
                  <TableRow sx={{ '& > th': { color: muted, fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${border}` } }}>
                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Warehouse</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Min Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map(item => {
                    const isLow = item.quantity <= item.minStock;
                    return (
                      <TableRow key={item.id} hover sx={{ '& > td': { borderBottom: `1px solid ${border}`, color: '#d1d5db' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: text, fontSize: '0.75rem' }}>{item.name}</Typography>
                          <Typography variant="caption" color={muted} sx={{ fontSize: '0.6rem' }}>{item.id}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: text, fontSize: '0.7rem' }}>{item.warehouse}</TableCell>
                        <TableCell sx={{ color: text, fontSize: '0.7rem' }}>{item.quantity} {item.unit}</TableCell>
                        <TableCell sx={{ color: text, fontSize: '0.7rem' }}>{item.minStock}</TableCell>
                        <TableCell>
                          <Chip label={isLow ? 'Low Stock' : 'In Stock'} size="small" color={isLow ? 'error' : 'success'} variant="filled" sx={{ fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" startIcon={<Plus size={12} />} onClick={() => restock(item)} sx={{ fontSize: '0.65rem', minWidth: 0, p: '2px 8px', color: 'hsl(8, 85%, 55%)', borderColor: border }}>Restock</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
