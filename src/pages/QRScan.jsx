import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrderStatus } from '../firebase/services';
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
    <Box sx={{ maxWidth: 560, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4">QR Scanner</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Scan a delivery QR code to look up an order and mark it as delivered
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box id="qr-reader" className={`w-full ${scanning ? '' : 'hidden'}`} />
        {!scanning && !scannedData && !error && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <ScanLine size={64} style={{ color: '#94a3b8', marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body2" color="text.disabled">Point camera at a QR code</Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <XCircle size={48} color="#ef4444" style={{ marginBottom: 12 }} />
            <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>{error}</Typography>
            <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => { setError(null); startScan(); }}>
              Try Again
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={scanning ? <CameraOff size={20} /> : <Camera size={20} />}
          onClick={scanning ? stopScan : startScan}
          sx={{ borderRadius: 3, px: 4, py: 1.5 }}
          color={scanning ? 'error' : 'primary'}
        >
          {scanning ? 'Stop Scanner' : 'Start Scanner'}
        </Button>
      </Box>

      {scannedData && (
        <Paper sx={{ p: 2, bgcolor: 'success.main', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle size={20} />
          <Typography variant="body2" fontWeight={600}>Scanned: {scannedData}</Typography>
        </Paper>
      )}

      {/* Confirm Delivery Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Package size={20} color="#2563eb" />
          Confirm Delivery
        </DialogTitle>
        <DialogContent dividers>
          {scannedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>{scannedOrder.id?.slice(0, 10)}</Typography>
                <StatusBadge status={scannedOrder.status} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MapPin size={16} color="#64748b" />
                <Typography variant="body2">
                  {scannedOrder.origin?.split(',')[0] || 'N/A'} → {scannedOrder.destination?.split(',')[0] || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <User size={16} color="#64748b" />
                <Typography variant="body2">
                  {scannedOrder.customer || scannedOrder.senderName || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Package size={16} color="#64748b" />
                <Typography variant="body2">
                  {scannedOrder.weight ? `${scannedOrder.weight} kg` : 'N/A'} · {scannedOrder.vehicleType || 'N/A'} · ₦{scannedOrder.cost?.toLocaleString() || 'N/A'}
                </Typography>
              </Box>

              {scannedOrder.description && (
                <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Description:</Typography>
                  <Typography variant="body2">{scannedOrder.description}</Typography>
                </Box>
              )}

              {scannedOrder.trackingHistory?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Clock size={12} /> Last Update:
                  </Typography>
                  <Typography variant="body2">
                    {scannedOrder.trackingHistory[scannedOrder.trackingHistory.length - 1].status} — {new Date(scannedOrder.trackingHistory[scannedOrder.trackingHistory.length - 1].timestamp).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider />

              {isDelivered ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 8 }} />
                  <Chip icon={<CheckCircle size={16} />} label="Already delivered" color="success" sx={{ fontWeight: 600 }} />
                </Box>
              ) : isCancelled ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <XCircle size={48} color="#dc2626" style={{ marginBottom: 8 }} />
                  <Chip icon={<XCircle size={16} />} label="Order cancelled" color="error" sx={{ fontWeight: 600 }} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'warning.main', color: '#fff', borderRadius: 2, mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Mark this order as delivered?</Typography>
                    <Typography variant="caption">This action will update the order status permanently.</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
          <Button onClick={() => { setConfirmOpen(false); }} variant="outlined">
            {canMarkDelivered ? 'Cancel' : 'Close'}
          </Button>
          {canMarkDelivered && (
            <Button
              variant="contained"
              color="success"
              onClick={handleMarkDelivered}
              disabled={marking}
              startIcon={marking ? <Clock size={18} /> : <CheckCircle size={18} />}
            >
              {marking ? 'Updating...' : 'Confirm Delivered'}
            </Button>
          )}
          <Tooltip title="Scan another order">
            <IconButton onClick={handleRescan} color="primary" size="small">
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
            <History size={18} /> Recent Scans
          </Typography>
          <List dense disablePadding>
            {scanHistory.map((entry, i) => (
              <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircle size={18} color="#16a34a" />
                </ListItemIcon>
                <ListItemText
                  primary={`${entry.id?.slice(0, 10)} — ${entry.customer || 'N/A'}`}
                  secondary={`${entry.origin?.split(',')[0] || ''} → ${entry.destination?.split(',')[0] || ''} · ${new Date(entry.timestamp).toLocaleTimeString()}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip label="Delivered" size="small" color="success" sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
