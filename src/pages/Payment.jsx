import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrder } from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { CreditCard, Wallet, Banknote, Loader2, Building2 } from 'lucide-react';

const PM = [
  { n: 'Paystack', i: Building2, c: 'primary' },
  { n: 'Flutterwave', i: Wallet, c: 'secondary' },
  { n: 'Debit Card', i: CreditCard, c: 'info' },
  { n: 'Cash', i: Banknote, c: 'warning' },
];

export default function Payment() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selM, setSelM] = useState(null);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => { fetchOrders().then(setOrders); }, []);

  const resetCard = () => setCard({ number: '', expiry: '', cvv: '', name: '' });

  const handlePayment = (m) => {
    if (m === 'Debit Card') {
      if (!card.number || !card.expiry || !card.cvv || !card.name) { toast.error('Fill all card details'); return; }
      if (card.number.replace(/\s/g, '').length < 16) { toast.error('Invalid card number'); return; }
    }
    setProcessing(true);
    setTimeout(() => {
      toast.success(`${m} payment successful!`);
      const updated = orders.map(o => o.id === showModal?.id ? { ...o, paymentStatus: 'paid', paymentMethod: m } : o);
      setOrders(updated);
      updateOrder(showModal.id, { paymentStatus: 'paid', paymentMethod: m });
      setShowModal(null); setSelM(null); setProcessing(false); resetCard();
    }, 1500);
  };

  const fmtCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const paid = orders.filter(o => o.paymentStatus === 'paid');
  const pend = orders.filter(o => o.paymentStatus === 'pending');
  const rev = paid.reduce((s, o) => s + o.cost, 0);
  const revPend = pend.reduce((s, o) => s + o.cost, 0);

  const mi = (m) => {
    if (!m) return '—';
    if (m === 'Debit Card' || m === 'card') return <><CreditCard size={14} /> {m}</>;
    if (m === 'Cash' || m === 'cash') return <><Banknote size={14} /> {m}</>;
    if (m === 'Paystack') return <><Building2 size={14} /> Paystack</>;
    if (m === 'Flutterwave') return <><Wallet size={14} /> Flutterwave</>;
    return m;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Payments</Typography>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>₦{rev.toLocaleString()}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</Typography><Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3, color: '#f59e0b' }}>₦{revPend.toLocaleString()}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</Typography><Typography variant="body1" sx={{ color: text, fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{orders.length}</Typography></Paper></Grid>
      </Grid>
      <Paper sx={{ bgcolor: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${border}` }}><Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment History</Typography></Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{o.id?.slice(0, 8)}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell>₦{o.cost?.toLocaleString()}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{mi(o.paymentMethod)}</Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={o.paymentStatus} size="small" color={o.paymentStatus === 'paid' ? 'success' : 'warning'} variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    {o.paymentStatus === 'pending' ? (
                      <Button size="small" variant="contained" onClick={() => { resetCard(); setSelM(null); setShowModal(o); }}>Pay Now</Button>
                    ) : <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Paid ✓</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={!!showModal} onClose={() => !processing && setShowModal(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Make Payment</DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          <Typography variant="body2" sx={{ color: muted, mb: 2, fontSize: '0.75rem' }}>Order: {showModal?.id?.slice(0, 8)} • Amount: <strong style={{ color: text }}>₦{showModal?.cost?.toLocaleString()}</strong></Typography>
          {!selM ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {PM.map(m => {
                const I = m.i;
                return (
                  <Button key={m.n} variant="outlined" color={m.c} onClick={() => setSelM(m.n)} startIcon={<I size={16} />} fullWidth sx={{ py: 1, justifyContent: 'center', fontSize: '0.75rem', borderColor: border, '&:hover': { borderWidth: 2 } }}>{m.n}</Button>
                );
              })}
            </Box>
          ) : (
            <Box>
              {selM === 'Debit Card' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                  <TextField label="Cardholder Name" value={card.name} onChange={e => setCard(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
                  <TextField label="Card Number" value={card.number} onChange={e => setCard(f => ({ ...f, number: fmtCard(e.target.value) }))} placeholder="4242 4242 4242 4242" fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><CreditCard size={16} /></InputAdornment> } }} />
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField label="Expiry" value={card.expiry} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCard(f => ({ ...f, expiry: v })); }} placeholder="MM/YY" fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
                    <TextField label="CVV" value={card.cvv} onChange={e => setCard(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="123" fullWidth size="small" type="password" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
                  </Box>
                </Box>
              )}
              <Button variant="contained" color="success" onClick={() => handlePayment(selM)} disabled={processing} startIcon={processing ? <Loader2 size={16} /> : <CreditCard size={16} />} fullWidth sx={{ py: 1, fontSize: '0.75rem', mb: 1 }}>{processing ? 'Processing...' : `Pay ₦${showModal?.cost?.toLocaleString()}`}</Button>
              <Button fullWidth size="small" onClick={() => setSelM(null)} disabled={processing} color="inherit" sx={{ fontSize: '0.7rem' }}>Choose another method</Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${border}`, px: 3, pb: 2 }}>
          <Button onClick={() => { setShowModal(null); setSelM(null); }} disabled={processing} color="inherit" sx={{ fontSize: '0.75rem', color: muted }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
