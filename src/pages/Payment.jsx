import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrder } from '../firebase/services';
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

const PAYMENT_METHODS = [
  { name: 'Paystack', icon: Building2, color: 'primary' },
  { name: 'Flutterwave', icon: Wallet, color: 'secondary' },
  { name: 'Debit Card', icon: CreditCard, color: 'info' },
  { name: 'Cash', icon: Banknote, color: 'warning' },
];

export default function Payment() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => { fetchOrders().then(setOrders); }, []);

  const resetCardForm = () => setCardForm({ number: '', expiry: '', cvv: '', name: '' });

  const handlePayment = (method) => {
    if (method === 'Debit Card') {
      if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
        toast.error('Fill all card details');
        return;
      }
      if (cardForm.number.replace(/\s/g, '').length < 16) {
        toast.error('Invalid card number');
        return;
      }
    }
    setProcessing(true);
    setTimeout(() => {
      toast.success(`${method} payment successful!`);
      const updatedOrders = orders.map(o => o.id === showModal?.id ? { ...o, paymentStatus: 'paid', paymentMethod: method } : o);
      setOrders(updatedOrders);
      updateOrder(showModal.id, { paymentStatus: 'paid', paymentMethod: method });
      setShowModal(null);
      setSelectedMethod(null);
      setProcessing(false);
      resetCardForm();
    }, 1500);
  };

  const formatCardNumber = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const paid = orders.filter(o => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const totalRevenue = paid.reduce((s, o) => s + o.cost, 0);
  const pendingRevenue = pendingOrders.reduce((s, o) => s + o.cost, 0);

  const methodIcon = (m) => {
    if (!m) return '—';
    if (m === 'Debit Card' || m === 'card') return <><CreditCard size={14} /> {m}</>;
    if (m === 'Cash' || m === 'cash') return <><Banknote size={14} /> {m}</>;
    if (m === 'Paystack') return <><Building2 size={14} /> Paystack</>;
    if (m === 'Flutterwave') return <><Wallet size={14} /> Flutterwave</>;
    return m;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Payments</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Total Revenue</Typography><Typography variant="h5" sx={{ mt: 0.5 }}>₦{totalRevenue.toLocaleString()}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Pending</Typography><Typography variant="h5" sx={{ mt: 0.5, color: 'warning.main' }}>₦{pendingRevenue.toLocaleString()}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Transactions</Typography><Typography variant="h5" sx={{ mt: 0.5 }}>{orders.length}</Typography></Paper></Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="h6">Payment History</Typography></Box>
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
              {orders.map(order => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.id?.slice(0, 8)}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>₦{order.cost?.toLocaleString()}</TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'capitalize' }}>
                    {methodIcon(order.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    <Chip label={order.paymentStatus} size="small" color={order.paymentStatus === 'paid' ? 'success' : 'warning'} variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    {order.paymentStatus === 'pending' ? (
                      <Button size="small" variant="contained" onClick={() => { resetCardForm(); setSelectedMethod(null); setShowModal(order); }}>Pay Now</Button>
                    ) : <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Paid ✓</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!showModal} onClose={() => !processing && setShowModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Order: {showModal?.id?.slice(0, 8)} • Amount: <strong>₦{showModal?.cost?.toLocaleString()}</strong>
          </Typography>

          {!selectedMethod ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.name}
                    variant="outlined"
                    color={method.color}
                    onClick={() => setSelectedMethod(method.name)}
                    startIcon={<Icon size={18} />}
                    fullWidth
                    sx={{ py: 1.5, justifyContent: 'center', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    {method.name}
                  </Button>
                );
              })}
            </Box>
          ) : (
            <Box>
              {selectedMethod === 'Debit Card' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                  <TextField
                    label="Cardholder Name"
                    value={cardForm.name}
                    onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Card Number"
                    value={cardForm.number}
                    onChange={e => setCardForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))}
                    placeholder="4242 4242 4242 4242"
                    fullWidth
                    size="small"
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><CreditCard size={18} /></InputAdornment> } }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Expiry"
                      value={cardForm.expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                        setCardForm(f => ({ ...f, expiry: v }));
                      }}
                      placeholder="MM/YY"
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="CVV"
                      value={cardForm.cvv}
                      onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      placeholder="123"
                      fullWidth
                      size="small"
                      type="password"
                    />
                  </Box>
                </Box>
              )}
              <Button
                variant="contained"
                color="success"
                onClick={() => handlePayment(selectedMethod)}
                disabled={processing}
                startIcon={processing ? <Loader2 size={18} /> : <CreditCard size={18} />}
                fullWidth
                sx={{ py: 1.5, mb: 1 }}
              >
                {processing ? 'Processing...' : `Pay ₦${showModal?.cost?.toLocaleString()}`}
              </Button>
              <Button fullWidth size="small" onClick={() => setSelectedMethod(null)} disabled={processing} color="inherit">
                Choose another method
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowModal(null); setSelectedMethod(null); }} disabled={processing} color="inherit">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
