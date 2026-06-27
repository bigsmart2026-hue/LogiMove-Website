import { useState, useEffect, useMemo } from 'react';
import {
  fetchVehicles, fetchDrivers, fetchOrders, addVehicle, updateVehicle,
  addActivityLog, addDriver,
} from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
import MapLibreMap from '../components/MapLibreMap';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import toast from 'react-hot-toast';
import {
  Truck, Bike, Car, Package, Users, Gauge, Battery, Map,
  UserPlus, Phone, Mail, Star, X, Plus, Navigation,
  TrendingUp, TrendingDown, Zap, Circle, Activity,
} from 'lucide-react';

const VEHICLE_TABS = [
  { key: 'all', label: 'All Fleet', icon: Truck },
  { key: 'truck', label: 'Long-haul Trucks', icon: Truck },
  { key: 'van', label: 'Delivery Vans', icon: Package },
  { key: 'car', label: 'Dispatch Cars', icon: Car },
  { key: 'bike', label: 'Last-mile Bikes', icon: Bike },
];

const TYPE_COLORS = { truck: 'hsl(8, 85%, 55%)', van: '#8b5cf6', car: '#10b981', bike: '#f59e0b' };
const TYPE_ICONS = { truck: Truck, van: Package, car: Car, bike: Bike };
const STATUS_COLORS = { available: '#10b981', 'on-delivery': 'hsl(8, 85%, 55%)', break: '#f59e0b', offline: '#6b7280' };
const FATIGUE_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

function FleetStatCard({ icon, label, value, sub, color = 'hsl(8, 85%, 55%)', isDark }) {
  const bgc = isDark ? '#111827' : '#fff';
  const bord = isDark ? '#1f2937' : '#e2e8f0';
  const txt = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  return (
    <Paper sx={{ p: 2, bgcolor: bgc, border: `1px solid ${bord}`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}20`, color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: txt, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: sub.color || muted, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
            {sub.icon} {sub.text}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default function FleetManagement() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vehicleTab, setVehicleTab] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [detailDriver, setDetailDriver] = useState(null);

  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', type: 'van', capacity: '', driverId: '' });
  const [driverForm, setDriverForm] = useState({ name: '', email: '', phone: '', vehicleType: 'bike' });
  const [assignOrder, setAssignOrder] = useState('');
  const [assignDriver, setAssignDriver] = useState('');

  const loadData = () => Promise.all([fetchVehicles(), fetchDrivers(), fetchOrders()]).then(([v, d, o]) => { setVehicles(v); setDrivers(d); setOrders(o); });
  useEffect(() => { loadData(); }, []);

  const filteredVehicles = vehicleTab === 'all' ? vehicles : vehicles.filter(v => v.type === vehicleTab);

  const unassignedOrders = orders.filter(o => !o.assignedDriver && o.status !== 'delivered' && o.status !== 'cancelled');
  const activeDeliveries = (driverId) => orders.filter(o => o.assignedDriver === driverId && o.status !== 'delivered' && o.status !== 'cancelled').length;

  const kpiData = useMemo(() => {
    const totalCost = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.cost || 0), 0);
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const totalDistance = orders.reduce((s, o) => s + (o.distance || 0), 0);
    const idleVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'inactive').length;
    const fuelTotal = vehicles.reduce((s, v) => s + (100 - (v.fuelLevel || 0)), 0);
    return {
      costPerDelivery: delivered ? totalCost / delivered : 0,
      fleetIdleTime: vehicles.length ? Math.round((idleVehicles / vehicles.length) * 100) : 0,
      avgFulfillmentSpeed: delivered && totalDistance ? Math.round(totalDistance / delivered) : 0,
      fuelEfficiency: vehicles.length ? Math.round(fuelTotal / vehicles.length) : 0,
    };
  }, [orders, vehicles]);

  const vehicleTypeDistribution = useMemo(() => {
    const dist = { truck: 0, van: 0, car: 0, bike: 0 };
    vehicles.forEach(v => { if (dist[v.type] !== undefined) dist[v.type]++; });
    return dist;
  }, [vehicles]);

  const driverAvailability = useMemo(() => {
    if (!drivers.length) return { available: 0, onDelivery: 0, break: 0, offline: 0 };
    return {
      available: drivers.filter(d => d.status === 'available').length,
      onDelivery: drivers.filter(d => d.status === 'on-delivery').length,
      break: drivers.filter(d => d.status === 'break').length,
      offline: drivers.filter(d => d.status !== 'available' && d.status !== 'on-delivery' && d.status !== 'break').length,
    };
  }, [drivers]);

  const getVehicleForDriver = (driverId) => vehicles.find(v => v.driverId === driverId);
  const getVehicleSuggestion = (o) => {
    if (!o) return 'bike';
    const w = o.weight || 0;
    if (w <= 10) return 'bike';
    if (w <= 100) return 'van';
    return 'truck';
  };

  const mapMarkers = useMemo(() => [
    ...vehicles.filter(v => v.location).map(v => ({ lat: v.location.lat, lng: v.location.lng, label: `${TYPE_ICONS[v.type] ? TYPE_ICONS[v.type].name : 'Truck'} ${v.plateNumber}`, color: v.status === 'active' ? 'hsl(8, 85%, 55%)' : '#ef4444', type: 'vehicle' })),
    ...drivers.filter(d => d.location).map(d => ({ lat: d.location.lat, lng: d.location.lng, label: d.name, color: STATUS_COLORS[d.status] || '#6b7280', type: 'driver' })),
  ], [vehicles, drivers]);

  const handleAddVehicle = async () => {
    if (!newVehicle.plateNumber || !newVehicle.type) { toast.error('Fill required fields'); return; }
    await addVehicle({ ...newVehicle, capacity: Number(newVehicle.capacity) || 500 });
    await addActivityLog(`Added vehicle ${newVehicle.plateNumber}`);
    toast.success('Vehicle added');
    setAddVehicleOpen(false);
    setNewVehicle({ plateNumber: '', type: 'van', capacity: '', driverId: '' });
    loadData();
  };

  const handleAddDriver = async () => {
    if (!driverForm.name || !driverForm.email) { toast.error('Name and email required'); return; }
    await addDriver({ ...driverForm, status: 'available', rating: 5.0, totalDeliveries: 0, earnings: 0 });
    if (assignOrder) { const d = (await fetchDrivers()).find(d => d.email === driverForm.email); if (d) await assignDriver(assignOrder, d.id); }
    toast.success(`Driver ${driverForm.name} added`);
    setAddDriverOpen(false);
    setDriverForm({ name: '', email: '', phone: '', vehicleType: 'bike' });
    setAssignOrder('');
    loadData();
  };

  const handleAssignOrder = async () => {
    if (!assignOrder || !assignDriver) { toast.error('Select order and driver'); return; }
    await assignDriver(assignOrder, assignDriver);
    await addActivityLog(`Order ${assignOrder} assigned to driver ${assignDriver}`);
    toast.success('Order assigned');
    setAssignOpen(false);
    setAssignOrder('');
    setAssignDriver('');
    loadData();
  };

  const toggleVehicleStatus = async (id, current) => {
    const next = current === 'active' ? 'inactive' : 'active';
    await updateVehicle(id, { status: next });
    await addActivityLog(`Vehicle ${id} → ${next}`);
    loadData();
  };

  const vehicleCostData = useMemo(() => {
    const byType = { truck: { cost: 0, count: 0 }, van: { cost: 0, count: 0 }, car: { cost: 0, count: 0 }, bike: { cost: 0, count: 0 } };
    orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
      const type = o.vehicleType || 'van';
      if (byType[type]) { byType[type].cost += (o.cost || 0); byType[type].count++; }
    });
    return Object.entries(byType).map(([type, data]) => ({ type, avgCost: data.count ? data.cost / data.count : 0, count: data.count }));
  }, [orders]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: isDark ? '#0a0f1a' : '#f1f5f9', minHeight: '100vh', p: { xs: 2, md: 3 }, color: text }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 0.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Fleet Operations</Typography>
          <Typography variant="caption" sx={{ color: muted, fontSize: '0.7rem' }}>Real-time dispatch & fleet intelligence</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<UserPlus size={14} />}
            onClick={() => setAddDriverOpen(true)}
            sx={{ borderColor: border, color: muted, fontSize: '0.75rem', '&:hover': { borderColor: 'hsl(8, 85%, 55%)', color: 'hsl(8, 85%, 55%)' } }}>Add Driver</Button>
          <Button size="small" variant="outlined" startIcon={<Plus size={14} />}
            onClick={() => setAddVehicleOpen(true)}
            sx={{ borderColor: border, color: muted, fontSize: '0.75rem', '&:hover': { borderColor: 'hsl(8, 85%, 55%)', color: 'hsl(8, 85%, 55%)' } }}>Add Vehicle</Button>
          <Button size="small" variant="contained" startIcon={<Navigation size={14} />}
            onClick={() => setAssignOpen(true)}
            sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.75rem', '&:hover': { bgcolor: 'hsl(8, 85%, 48%)' } }}>Dispatch</Button>
        </Box>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FleetStatCard icon={<TrendingDown size={18} />} label="Cost / Delivery"
            value={`₦${Math.round(kpiData.costPerDelivery).toLocaleString()}`}
            sub={{ text: `${orders.filter(o => o.paymentStatus === 'paid').length} paid orders` }} color="#ef4444" isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FleetStatCard icon={<Activity size={18} />} label="Fleet Idle Time"
            value={`${kpiData.fleetIdleTime}%`}
            sub={{ text: `${vehicles.filter(v => v.status === 'active').length} active`, icon: <Circle size={8} /> }} color="#f59e0b" isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FleetStatCard icon={<Gauge size={18} />} label="Avg Fulfillment"
            value={`${kpiData.avgFulfillmentSpeed} km`}
            sub={{ text: `${orders.filter(o => o.status === 'delivered').length} delivered` }} color="hsl(8, 85%, 55%)" isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FleetStatCard icon={<Zap size={18} />} label="Fuel / Battery Eff"
            value={`${kpiData.fuelEfficiency}%`}
            sub={{ text: `${vehicles.filter(v => v.type === 'bike').length} electric`, icon: <Battery size={8} /> }} color="#8b5cf6" isDark={isDark} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 1.5, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(TYPE_COLORS).map(([type, color]) => {
                const IconComp = TYPE_ICONS[type];
                return (
                  <Chip key={type} icon={IconComp ? <IconComp size={12} /> : undefined}
                    label={`${type} (${vehicleTypeDistribution[type] || 0})`} size="small"
                    sx={{ bgcolor: `${color}20`, color, border: `1px solid ${color}40`, fontSize: '0.6rem', fontWeight: 600, height: 22 }} />
                );
              })}
            </Box>
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
              <Chip icon={<Map size={12} />} label={`${mapMarkers.length} assets`} size="small"
                sx={{ bgcolor: border, color: muted, fontSize: '0.6rem', height: 22 }} />
            </Box>
            <MapLibreMap center={[9.082, 8.6753]} zoom={6} markers={mapMarkers} className="h-72 md:h-96 w-full rounded-lg" />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Users size={14} /> Driver Availability
            </Typography>
            <Grid container spacing={0.5} sx={{ mb: 1.5 }}>
              {[
                { label: 'Available', value: driverAvailability.available, color: '#10b981' },
                { label: 'On Delivery', value: driverAvailability.onDelivery, color: 'hsl(8, 85%, 55%)' },
                { label: 'Break', value: driverAvailability.break, color: '#f59e0b' },
                { label: 'Offline', value: driverAvailability.offline, color: '#6b7280' },
              ].map(s => (
                <Grid size={6} key={s.label}>
                  <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: s.color, fontWeight: 700, fontSize: '1rem' }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {drivers.slice(0, 8).map(d => {
                const vehicle = getVehicleForDriver(d.id);
                const TypeIcon = TYPE_ICONS[vehicle?.type] || Truck;
                const fatigue = d.fatigue || 'low';
                const activeJobs = activeDeliveries(d.id);
                return (
                  <Box key={d.id} onClick={() => setDetailDriver(d)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: isDark ? '#1a1f2e' : '#f8fafc', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: isDark ? '#1f2937' : '#f1f5f9' } }}>
                    <Badge overlap="circular" variant="dot"
                      sx={{ '& .MuiBadge-badge': { bgcolor: STATUS_COLORS[d.status] || '#6b7280', width: 8, height: 8, borderRadius: '50%', bottom: 2, right: 2 } }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: `${TYPE_COLORS[vehicle?.type] || 'hsl(8, 85%, 55%)'}30`, color: TYPE_COLORS[vehicle?.type] || 'hsl(8, 85%, 55%)', fontSize: '0.65rem', fontWeight: 700 }}>
                        {d.name?.charAt(0)}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: text, fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.2 }}>{d.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {vehicle && <TypeIcon size={10} color={muted} />}
                        <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>
                          {vehicle ? `${vehicle.plateNumber} · ` : ''}{activeJobs} active
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={`Fatigue: ${fatigue}`}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: FATIGUE_COLORS[fatigue] || '#6b7280' }} />
                      </Tooltip>
                      <Tooltip title="Call">
                        <IconButton size="small" sx={{ color: muted, width: 20, height: 20 }}><Phone size={10} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Message">
                        <IconButton size="small" sx={{ color: muted, width: 20, height: 20 }}><Mail size={10} /></IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
          <Tabs value={vehicleTab} onChange={(_, v) => setVehicleTab(v)}
            sx={{ minHeight: 36, '& .MuiTabs-indicator': { bgcolor: 'hsl(8, 85%, 55%)' }, '& .MuiTab-root': { minHeight: 36, py: 0.5, color: muted, fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', '&.Mui-selected': { color: 'hsl(8, 85%, 55%)' } } }}>
            {VEHICLE_TABS.map(t => <Tab key={t.key} value={t.key} label={t.label} icon={<t.icon size={14} />} iconPosition="start" />)}
          </Tabs>
        </Box>
        <Divider sx={{ borderColor: border }} />

        <div style={{ overflow: 'auto', maxHeight: 320 }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Driver</th>
                <th>Fuel/Battery</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => {
                const driver = drivers.find(d => d.id === v.driverId);
                const TypeIcon = TYPE_ICONS[v.type] || Truck;
                const color = TYPE_COLORS[v.type] || '#6b7280';
                const isAlert = v.status === 'maintenance' || (v.fuelLevel || 0) < 15;
                return (
                  <tr key={v.id} className={`data-row ${isAlert ? 'data-row--alert' : ''}`} onClick={() => setSelectedVehicle(v)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TypeIcon size={16} color={color} />
                        <span style={{ fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600 }}>{v.plateNumber}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
                        background: `${color}20`,
                        color,
                        textTransform: 'capitalize',
                      }}>
                        {v.type}
                      </span>
                    </td>
                    <td style={{ color: driver ? undefined : 'hsl(214, 12%, 68%)' }}>
                      {driver?.name || 'Unassigned'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 48,
                          height: 4,
                          borderRadius: 2,
                          background: 'hsl(222, 8%, 32%)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${v.fuelLevel || 0}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: (v.fuelLevel || 0) > 50 ? 'hsl(145, 65%, 45%)' : (v.fuelLevel || 0) > 20 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 78%, 55%)',
                            transition: 'width 300ms ease',
                          }} />
                        </div>
                        <span className="tabular-nums" style={{ fontSize: '0.6rem', color: 'hsl(214, 12%, 68%)' }}>{v.fuelLevel || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${
                        v.status === 'active' ? 'status-pill--clear' :
                        v.status === 'maintenance' ? 'status-pill--amber' :
                        'status-pill--muted'
                      }`}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="3" /></svg>
                        {v.status}
                      </span>
                    </td>
                    <td className="tabular-nums" style={{ color: 'hsl(214, 12%, 68%)' }}>{v.capacity || '-'} kg</td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVehicleStatus(v.id, v.status); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'hsl(8, 85%, 55%)',
                          cursor: 'pointer',
                          fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Paper>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Package size={14} /> Live Dispatch Queue · {unassignedOrders.length} unassigned
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 240, overflow: 'auto' }}>
              {unassignedOrders.slice(0, 10).map(o => {
                const suggestion = getVehicleSuggestion(o);
                const sugColor = TYPE_COLORS[suggestion] || '#6b7280';
                const SugIcon = TYPE_ICONS[suggestion] || Truck;
                return (
                  <Box key={o.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, bgcolor: isDark ? '#1a1f2e' : '#f8fafc', border: `1px solid ${border}` }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: text, fontWeight: 600, fontSize: '0.75rem' }}>
                        {o.id?.slice(0, 10)} — {o.customer || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>
                        {o.origin?.split(',')[0]} → {o.destination?.split(',')[0]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title={`Suggested: ${suggestion}`}>
                        <Chip icon={<SugIcon size={10} />} label={`${o.weight || '-'}kg`} size="small"
                          sx={{ bgcolor: `${sugColor}20`, color: sugColor, fontSize: '0.6rem', fontWeight: 600, height: 20 }} />
                      </Tooltip>
                      <Typography variant="caption" color="#f59e0b" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>₦{o.cost?.toLocaleString()}</Typography>
                      <Button size="small" variant="text"
                        onClick={() => { setAssignOrder(o.id); setAssignOpen(true); }}
                        sx={{ fontSize: '0.6rem', color: 'hsl(8, 85%, 55%)', minWidth: 0, p: 0.5 }}>Assign</Button>
                    </Box>
                  </Box>
                );
              })}
              {unassignedOrders.length === 0 && (
                <Typography variant="caption" sx={{ color: muted, textAlign: 'center', py: 3 }}>No unassigned orders</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp size={14} /> Cost-per-Delivery by Vehicle
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {vehicleCostData.map(({ type, avgCost, count }) => {
                const color = TYPE_COLORS[type] || '#6b7280';
                const Icon = TYPE_ICONS[type] || Truck;
                const maxCost = Math.max(...vehicleCostData.map(d => d.avgCost), 1);
                return (
                  <Box key={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon size={12} color={color} />
                        <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.65rem', textTransform: 'capitalize' }}>{type}</Typography>
                        <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>({count} deliveries)</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: text, fontSize: '0.65rem', fontWeight: 600 }}>₦{Math.round(avgCost).toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(avgCost / maxCost) * 100}
                      sx={{ height: 5, borderRadius: 2, bgcolor: border, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 } }} />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={!!selectedVehicle} onClose={() => setSelectedVehicle(null)}
        PaperProps={{ sx: { width: 360, bgcolor: bg, borderLeft: `1px solid ${border}`, color: text } }}>
        {selectedVehicle && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>{selectedVehicle.plateNumber}</Typography>
              <IconButton onClick={() => setSelectedVehicle(null)} size="small" sx={{ color: muted }}><X size={18} /></IconButton>
            </Box>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Fuel</Typography>
                  <Typography variant="body2" sx={{ color: text, fontWeight: 700 }}>{selectedVehicle.fuelLevel || 0}%</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Battery</Typography>
                  <Typography variant="body2" sx={{ color: text, fontWeight: 700 }}>{selectedVehicle.batteryLevel != null ? `${selectedVehicle.batteryLevel}%` : 'N/A'}</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Capacity</Typography>
                  <Typography variant="body2" sx={{ color: text, fontWeight: 700 }}>{selectedVehicle.capacity || '-'} kg</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Status</Typography>
                  <Chip label={selectedVehicle.status} size="small"
                    sx={{ bgcolor: selectedVehicle.status === 'active' ? '#10b98120' : '#6b728020', color: selectedVehicle.status === 'active' ? '#10b981' : '#6b7280', fontSize: '0.6rem', fontWeight: 600, mt: 0.3 }} />
                </Box>
              </Grid>
            </Grid>
            <Button fullWidth variant="outlined" size="small"
              onClick={() => toggleVehicleStatus(selectedVehicle.id, selectedVehicle.status)}
              sx={{ borderColor: border, color: muted, fontSize: '0.7rem', mb: 1 }}>Toggle Availability</Button>
          </Box>
        )}
      </Drawer>

      <Drawer anchor="right" open={!!detailDriver} onClose={() => setDetailDriver(null)}
        PaperProps={{ sx: { width: 360, bgcolor: bg, borderLeft: `1px solid ${border}`, color: text } }}>
        {detailDriver && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'hsla(8, 85%, 55%, 0.12)', color: 'hsl(8, 85%, 55%)', fontWeight: 700 }}>{detailDriver.name?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{detailDriver.name}</Typography>
                  <Chip label={detailDriver.status} size="small"
                    sx={{ bgcolor: `${STATUS_COLORS[detailDriver.status] || '#6b7280'}20`, color: STATUS_COLORS[detailDriver.status] || '#6b7280', fontSize: '0.6rem', fontWeight: 600, height: 18 }} />
                </Box>
              </Box>
              <IconButton onClick={() => setDetailDriver(null)} size="small" sx={{ color: muted }}><X size={18} /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {detailDriver.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muted }}>
                  <Phone size={14} /> <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{detailDriver.phone}</Typography>
                </Box>
              )}
              {detailDriver.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muted }}>
                  <Mail size={14} /> <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{detailDriver.email}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muted }}>
                <Star size={14} color="#f59e0b" /> <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{detailDriver.rating} · {detailDriver.totalDeliveries} deliveries</Typography>
              </Box>
            </Box>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Active Jobs</Typography>
                  <Typography variant="body2" sx={{ color: 'hsl(8, 85%, 55%)', fontWeight: 700 }}>{activeDeliveries(detailDriver.id)}</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Earnings</Typography>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>₦{detailDriver.earnings?.toLocaleString()}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Drawer>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Navigation size={18} /> Dispatch Order
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Select Order</InputLabel>
              <Select value={assignOrder} onChange={e => setAssignOrder(e.target.value)} label="Select Order"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                {unassignedOrders.map(o => (
                  <MenuItem key={o.id} value={o.id}>{o.id?.slice(0, 10)} — {o.customer} ({o.origin?.split(',')[0]} → {o.destination?.split(',')[0]})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Assign Driver</InputLabel>
              <Select value={assignDriver} onChange={e => setAssignDriver(e.target.value)} label="Assign Driver"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                {drivers.filter(d => d.status === 'available').map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name} ({d.vehicleType})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setAssignOpen(false)} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.75rem' }}>Cancel</Button>
          <Button onClick={handleAssignOrder} variant="contained" sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.75rem', '&:hover': { bgcolor: 'hsl(8, 85%, 48%)' } }}>Assign</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDriverOpen} onClose={() => setAddDriverOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserPlus size={18} /> Add New Driver
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" value={driverForm.name} onChange={e => setDriverForm(f => ({ ...f, name: e.target.value }))} required fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Email" type="email" value={driverForm.email} onChange={e => setDriverForm(f => ({ ...f, email: e.target.value }))} required fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Phone" value={driverForm.phone} onChange={e => setDriverForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Vehicle Type</InputLabel>
              <Select value={driverForm.vehicleType} onChange={e => setDriverForm(f => ({ ...f, vehicleType: e.target.value }))} label="Vehicle Type"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                <MenuItem value="bike">Bike</MenuItem>
                <MenuItem value="car">Car</MenuItem>
                <MenuItem value="van">Van</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setAddDriverOpen(false)} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.75rem' }}>Cancel</Button>
          <Button onClick={handleAddDriver} variant="contained" sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.75rem', '&:hover': { bgcolor: 'hsl(8, 85%, 48%)' } }}>Add Driver</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Plus size={18} /> Add New Vehicle
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Plate Number" value={newVehicle.plateNumber} onChange={e => setNewVehicle(f => ({ ...f, plateNumber: e.target.value }))} required fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: muted }}>Vehicle Type</InputLabel>
              <Select value={newVehicle.type} onChange={e => setNewVehicle(f => ({ ...f, type: e.target.value }))} label="Vehicle Type"
                sx={{ color: text, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiSvgIcon-root': { color: muted } }}>
                <MenuItem value="bike">Bike</MenuItem>
                <MenuItem value="car">Car</MenuItem>
                <MenuItem value="van">Van</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Capacity (kg)" type="number" value={newVehicle.capacity} onChange={e => setNewVehicle(f => ({ ...f, capacity: e.target.value }))} fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setAddVehicleOpen(false)} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.75rem' }}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained" sx={{ bgcolor: 'hsl(8, 85%, 55%)', fontSize: '0.75rem', '&:hover': { bgcolor: 'hsl(8, 85%, 48%)' } }}>Add Vehicle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
