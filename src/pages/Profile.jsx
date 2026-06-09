import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, saveAddress, fetchAddresses, deleteAddress as deleteAddressFirebase, addActivityLog } from '../firebase/services';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import { Save, Plus, Trash2, MapPin, Bell, Mail, Phone, User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', state: '' });

  useEffect(() => {
    if (user?.userId) {
      fetchAddresses(user.userId).then(setAddresses);
    }
  }, [user]);

  const saveProfile = async () => {
    try {
      await updateUserProfile(user.userId, { name, phone });
      await addActivityLog('Profile updated');
      toast.success('Profile saved');
    } catch { toast.error('Failed to save profile'); }
  };

  const addAddress = async () => {
    if (!newAddr.label || !newAddr.address) { toast.error('Fill required fields'); return; }
    const saved = await saveAddress(user.userId, { ...newAddr, id: Date.now().toString() });
    setAddresses(prev => [...prev, saved]);
    await addActivityLog(`Added address: ${newAddr.label}`);
    toast.success('Address saved');
    setNewAddr({ label: '', address: '', city: '', state: '' });
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddressFirebase(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    await addActivityLog(`Deleted address: ${id}`);
    toast.success('Address removed');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Profile & Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>{user?.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip label={user?.role} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, textTransform: 'capitalize' }} />
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Full Name" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" defaultValue={user?.email} disabled fullWidth size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 XXX XXX XXXX" fullWidth size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="contained" startIcon={<Save size={16} />} onClick={saveProfile}>Save Changes</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MapPin size={20} /> Saved Addresses
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {addresses.length === 0 && <Typography variant="body2" color="text.secondary">No saved addresses yet</Typography>}
          {addresses.map(addr => (
            <Paper key={addr.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{addr.label}</Typography>
                <Typography variant="caption" color="text.secondary">{addr.address}, {addr.city}, {addr.state}</Typography>
              </Box>
              <IconButton size="small" color="error" onClick={() => handleDeleteAddress(addr.id)}><Trash2 size={16} /></IconButton>
            </Paper>
          ))}
        </Box>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 3 }}><TextField size="small" placeholder="Label (Home/Work)" value={newAddr.label} onChange={e => setNewAddr(a => ({ ...a, label: e.target.value }))} fullWidth /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField size="small" placeholder="Address" value={newAddr.address} onChange={e => setNewAddr(a => ({ ...a, address: e.target.value }))} fullWidth /></Grid>
          <Grid size={{ xs: 12, sm: 3 }}><TextField size="small" placeholder="City" value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} fullWidth /></Grid>
          <Grid size={{ xs: 12, sm: 2 }}><Button variant="contained" color="success" startIcon={<Plus size={16} />} onClick={addAddress} fullWidth sx={{ height: '100%' }}>Add</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Bell size={20} /> Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControlLabel control={<Checkbox defaultChecked />} label={<Typography variant="body2">Email notifications for status updates</Typography>} />
          <FormControlLabel control={<Checkbox defaultChecked />} label={<Typography variant="body2">SMS alerts for delivery confirmation</Typography>} />
          <FormControlLabel control={<Checkbox />} label={<Typography variant="body2">Leave packages at door by default</Typography>} />
          <FormControlLabel control={<Checkbox />} label={<Typography variant="body2">WhatsApp tracking updates</Typography>} />
        </Box>
      </Paper>
    </Box>
  );
}
