import { useState, useEffect, useRef } from 'react';
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
import { Camera, CameraOff, CheckCircle, XCircle, Package } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function QRScan() {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  const startScan = () => {
    setScanning(true);
    setScannedData('');
    setScannedOrder(null);
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
              toast.success(`Order found: ${decodedText}`);
            } else {
              toast.error('Order not found');
              setScannedData('');
            }
          } catch {
            toast.error('Failed to look up order');
            setScannedData('');
          }
        },
        () => {}
      ).catch(() => {
        toast.error('Camera access denied or not available');
        setScanning(false);
      });
    }).catch(() => {
      toast.error('QR scanner library not available');
      setScanning(false);
    });
  };

  const stopScan = () => {
    if (qrInstance.current) { qrInstance.current.stop().catch(() => {}); qrInstance.current = null; }
    setScanning(false);
  };

  const handleMarkDelivered = async () => {
    if (!scannedOrder) return;
    setMarking(true);
    try {
      await updateOrderStatus(scannedOrder.id, 'delivered');
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

  useEffect(() => { return () => { if (qrInstance.current) qrInstance.current.stop().catch(() => {}); }; }, []);

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center' }}>
      <Typography variant="h4">QR Scanner</Typography>
      <Typography variant="body2" color="text.secondary">
        Scan a QR code to look up an order and mark it as delivered
      </Typography>

      <Paper sx={{ p: 3 }}>
        <div id="qr-reader" ref={qrRef} className={`w-full ${scanning ? '' : 'hidden'}`} />
        {!scanning && !scannedData && (
          <Box sx={{ py: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>📷</Typography>
            <Typography variant="body2" color="text.disabled">Point camera at a QR code</Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={scanning ? <CameraOff size={18} /> : <Camera size={18} />}
          onClick={scanning ? stopScan : startScan}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {scanning ? 'Stop Scanner' : 'Start Scanner'}
        </Button>
      </Box>

      {scannedData && (
        <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
          <Typography variant="body2" fontWeight={600}>Scanned: {scannedData}</Typography>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delivery</DialogTitle>
        <DialogContent>
          {scannedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={600}>{scannedOrder.id?.slice(0, 10)}</Typography>
                <StatusBadge status={scannedOrder.status} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {scannedOrder.origin?.split(',')[0] || 'N/A'} → {scannedOrder.destination?.split(',')[0] || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {scannedOrder.customer || scannedOrder.senderName || 'N/A'} • ₦{scannedOrder.cost?.toLocaleString() || 'N/A'}
              </Typography>
              {scannedOrder.status === 'delivered' ? (
                <Chip icon={<CheckCircle size={16} />} label="Already delivered" color="success" sx={{ mt: 1 }} />
              ) : scannedOrder.status === 'cancelled' ? (
                <Chip icon={<XCircle size={16} />} label="Order cancelled" color="error" sx={{ mt: 1 }} />
 ) : (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'warning.main', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">Mark this order as delivered?</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          {scannedOrder && scannedOrder.status !== 'delivered' && scannedOrder.status !== 'cancelled' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleMarkDelivered}
              disabled={marking}
              startIcon={<CheckCircle size={18} />}
            >
              {marking ? 'Updating...' : 'Confirm Delivered'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
