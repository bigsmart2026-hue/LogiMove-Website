import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrderStatus } from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import { Camera, CameraOff, CheckCircle, XCircle, Package, MapPin, User, Clock, ScanLine, RotateCcw, History } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function QRScan() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [scannedData, setScannedData] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState(null);
  const qrInstance = useRef(null);

  const startScan = useCallback(() => {
    setScanning(true);
    setScannedData('');
    setScannedOrder(null);
    setError(null);
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const qr = new Html5Qrcode('qr-reader');
      qrInstance.current = qr;
      qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setScannedData(decodedText);
          qr.stop().catch(() => {});
          setScanning(false);
          try {
            const orders = await fetchOrders();
            const order = orders.find(o => o.id === decodedText || o.id?.startsWith(decodedText));
            if (order) {
              setScannedOrder(order);
              setConfirmOpen(true);
              toast.success(`Order found: ${order.id?.slice(0, 10)}`);
            } else {
              setError(`No order found for ID: ${decodedText}`);
              toast.error('Order not found');
              setScannedData('');
            }
          } catch {
            setError('Failed to look up order');
            toast.error('Failed to look up order');
            setScannedData('');
          }
        },
        () => {}
      ).catch(() => {
        toast.error('Camera access denied or not available');
        setScanning(false);
        setError('Camera access denied. Please grant camera permissions.');
      });
    }).catch(() => {
      toast.error('QR scanner library not available');
      setScanning(false);
      setError('QR scanner library failed to load.');
    });
  }, []);

  const stopScan = useCallback(() => {
    if (qrInstance.current) { qrInstance.current.stop().catch(() => {}); qrInstance.current = null; }
    setScanning(false);
  }, []);

  const handleMarkDelivered = async () => {
    if (!scannedOrder) return;
    setMarking(true);
    try {
      await updateOrderStatus(scannedOrder.id, 'delivered');
      const entry = {
        id: scannedOrder.id,
        customer: scannedOrder.customer || scannedOrder.senderName,
        origin: scannedOrder.origin,
        destination: scannedOrder.destination,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };
      setScanHistory(prev => [entry, ...prev.slice(0, 19)]);
      toast.success(`Order ${scannedOrder.id?.slice(0, 10)} marked as delivered!`);
      setConfirmOpen(false);
      setScannedOrder(null);
      setScannedData('');
    } catch (err) {
      toast.error('Failed to update order status');
    } finally {
      setMarking(false);
    }
  };

  const handleRescan = () => {
    setConfirmOpen(false);
    setScannedOrder(null);
    setScannedData('');
    setError(null);
    startScan();
  };

  useEffect(() => {
    return () => { if (qrInstance.current) qrInstance.current.stop().catch(() => {}); };
  }, []);

  const isDelivered = scannedOrder?.status === 'delivered';
  const isCancelled = scannedOrder?.status === 'cancelled';
  const canMarkDelivered = scannedOrder && !isDelivered && !isCancelled;

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>QR Scanner</Typography>
        <Typography variant="caption" sx={{ color: muted, fontSize: '0.7rem', mt: 0.3, display: 'block' }}>
          Scan a delivery QR code to look up an order and mark it as delivered
        </Typography>
      </Box>

      <Paper sx={{ p: 2, bgcolor: '#111827', border: '1px solid #1f2937' }}>
        <Box id="qr-reader" className={`w-full ${scanning ? '' : 'hidden'}`} />
        {!scanning && !scannedData && !error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <ScanLine size={40} style={{ color: muted, marginBottom: 12, opacity: 0.5 }} />
            <Typography variant="caption" sx={{ color: muted, fontSize: '0.7rem' }}>Point camera at a QR code</Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <XCircle size={32} color="#ef4444" style={{ marginBottom: 8 }} />
            <Typography variant="caption" color="#ef4444" sx={{ fontSize: '0.75rem', mb: 1.5, display: 'block' }}>{error}</Typography>
            <Button variant="outlined" size="small" startIcon={<RotateCcw size={12} />} onClick={() => { setError(null); startScan(); }} sx={{ fontSize: '0.7rem' }}>
              Try Again
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={scanning ? <CameraOff size={14} /> : <Camera size={14} />}
          onClick={scanning ? stopScan : startScan}
          sx={{ borderRadius: 2, px: 3, fontSize: '0.75rem' }}
          color={scanning ? 'error' : 'primary'}
        >
          {scanning ? 'Stop Scanner' : 'Start Scanner'}
        </Button>
      </Box>

      {scannedData && (
        <Paper sx={{ p: 1.5, bgcolor: bg, border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle size={14} />
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Scanned: {scannedData}</Typography>
        </Paper>
      )}

      {/* Confirm Delivery Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.95rem' }}>
          <Package size={16} color="hsl(8, 85%, 55%)" />
          Confirm Delivery
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          {scannedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.9rem', color: text }}>{scannedOrder.id?.slice(0, 10)}</Typography>
                <StatusBadge status={scannedOrder.status} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={12} color="#6b7280" />
                <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.7rem' }}>
                  {scannedOrder.origin?.split(',')[0] || 'N/A'} → {scannedOrder.destination?.split(',')[0] || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={12} color="#6b7280" />
                <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.7rem' }}>
                  {scannedOrder.customer || scannedOrder.senderName || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Package size={12} color="#6b7280" />
                <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.7rem' }}>
                  {scannedOrder.weight ? `${scannedOrder.weight} kg` : 'N/A'} · {scannedOrder.vehicleType || 'N/A'} · ₦{scannedOrder.cost?.toLocaleString() || 'N/A'}
                </Typography>
              </Box>

              {scannedOrder.description && (
                <Box sx={{ p: 1, bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem' }}>Description:</Typography>
                  <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.7rem' }}>{scannedOrder.description}</Typography>
                </Box>
              )}

              {scannedOrder.trackingHistory?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: muted, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3, fontSize: '0.6rem' }}>
                    <Clock size={10} /> Last Update:
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? '#d1d5db' : '#475569', fontSize: '0.7rem' }}>
                    {scannedOrder.trackingHistory[scannedOrder.trackingHistory.length - 1].status} — {new Date(scannedOrder.trackingHistory[scannedOrder.trackingHistory.length - 1].timestamp).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ borderColor: border }} />

              {isDelivered ? (
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <CheckCircle size={32} color="#10b981" style={{ marginBottom: 6 }} />
                  <Chip icon={<CheckCircle size={12} />} label="Already delivered" color="success" size="small" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                </Box>
              ) : isCancelled ? (
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <XCircle size={32} color="#ef4444" style={{ marginBottom: 6 }} />
                  <Chip icon={<XCircle size={12} />} label="Order cancelled" color="error" size="small" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f59e0b20', border: '1px solid #f59e0b40', borderRadius: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }}>Mark this order as delivered?</Typography>
                    <Typography variant="caption" sx={{ color: muted, fontSize: '0.6rem', display: 'block' }}>This action will update the order status permanently.</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => { setConfirmOpen(false); }} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.7rem' }}>
            {canMarkDelivered ? 'Cancel' : 'Close'}
          </Button>
          {canMarkDelivered && (
            <Button
              variant="contained"
              color="success"
              onClick={handleMarkDelivered}
              disabled={marking}
              size="small"
              startIcon={marking ? <Clock size={14} /> : <CheckCircle size={14} />}
              sx={{ fontSize: '0.7rem' }}
            >
              {marking ? 'Updating...' : 'Confirm Delivered'}
            </Button>
          )}
          <Tooltip title="Scan another order">
            <IconButton onClick={handleRescan} color="primary" size="small">
              <RotateCcw size={14} />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Scan History */}
      {scanHistory.length > 0 && (
      <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <History size={14} /> Recent Scans
          </Typography>
          <List dense disablePadding>
            {scanHistory.map((entry, i) => (
              <ListItem key={i} sx={{ px: 0, py: 0.3 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle size={14} color="#10b981" />
                </ListItemIcon>
                <ListItemText
                  primary={`${entry.id?.slice(0, 10)} — ${entry.customer || 'N/A'}`}
                  secondary={`${entry.origin?.split(',')[0] || ''} → ${entry.destination?.split(',')[0] || ''} · ${new Date(entry.timestamp).toLocaleTimeString()}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600, sx: { color: text, fontSize: '0.75rem' } }}
                  secondaryTypographyProps={{ variant: 'caption', sx: { color: muted, fontSize: '0.6rem' } }}
                />
                <Chip label="Delivered" size="small" color="success" sx={{ fontWeight: 600, height: 18, fontSize: '0.6rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
