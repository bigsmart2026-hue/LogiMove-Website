import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useThemeMode } from '../context/ThemeContext';
import { fetchInventory, updateInventoryItem, addActivityLog } from '../firebase/services';
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
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { Package, Plus, AlertTriangle } from 'lucide-react';

export default function InventoryTracking() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const loadData = () => fetchInventory().then(setItems);
  useEffect(() => { loadData(); }, []);

  const filteredItems = filter === 'low' ? items.filter(i => i.quantity <= i.minStock) : items;
  const lowStockItems = items.filter(i => i.quantity <= i.minStock);

  const restock = async (item) => {
    await updateInventoryItem(item.id, { quantity: (item.quantity || 0) + 10 });
    await addActivityLog(`Restocked ${item.name} +10`);
    toast.success(`${item.name}: Stock updated`);
    loadData();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#f3f4f6' : '#0f172a', letterSpacing: '-0.02em' }}>Inventory Tracking</Typography>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          <ToggleButton value="all" sx={{ fontSize: '0.7rem' }}>All ({items.length})</ToggleButton>
          <ToggleButton value="low" sx={{ fontSize: '0.7rem' }}>Low Stock ({lowStockItems.length})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}><Typography variant="caption" color={isDark ? '#9ca3af' : '#64748b'} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Items</Typography><Typography variant="body1" sx={{ color: isDark ? '#f3f4f6' : '#0f172a', fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{items.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}><Typography variant="caption" color={isDark ? '#9ca3af' : '#64748b'} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Quantity</Typography><Typography variant="body1" sx={{ color: isDark ? '#f3f4f6' : '#0f172a', fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}><Typography variant="caption" color={isDark ? '#9ca3af' : '#64748b'} sx={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Alerts</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#ef4444' }}>{lowStockItems.length}</Typography></Paper></Grid>
      </Grid>

      <Paper sx={{ bgcolor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
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
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.id}</Typography>
                    </TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.minStock}</TableCell>
                  <TableCell>
                    <Chip label={isLow ? 'Low Stock' : 'In Stock'} size="small" color={isLow ? 'error' : 'success'} variant="filled" sx={{ fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<Plus size={12} />} onClick={() => restock(item)} sx={{ fontSize: '0.65rem', minWidth: 0, p: '2px 8px' }}>Restock</Button>
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
