import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { fetchOrders, fetchDrivers, assignDriver } from '../firebase/services';
import StatusBadge from '../components/StatusBadge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { Eye, QrCode, X, MapPin, Package, User, Phone, CreditCard, Calendar, Navigation, Clock, Copy, Download, Printer, Truck } from 'lucide-react';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';

const statusColors = {
  pending: 'warning',
  assigned: 'info',
  'picked-up': 'primary',
  'in-transit': 'info',
  delivered: 'success',
  cancelled: 'error',
};

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`${isDragging ? 'opacity-50' : ''}`} {...attributes} {...listeners}>{children}</div>;
}

function TrackingTimeline({ history }) {
  if (!history || history.length === 0) return <Typography variant="body2" color="text.disabled">No tracking history available</Typography>;
  return (
    <Box sx={{ pl: 1 }}>
      {history.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, position: 'relative', pb: i < history.length - 1 ? 2 : 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
              width: 12, height: 12, borderRadius: '50%',
              bgcolor: i === history.length - 1 ? 'success.main' : 'primary.main',
              border: '2px solid',
              borderColor: i === history.length - 1 ? 'success.light' : 'primary.light',
              zIndex: 1,
            }} />
            {i < history.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
          </Box>
          <Box sx={{ flex: 1, pb: i < history.length - 1 ? 0 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={entry.status} size="small" color={statusColors[entry.status] || 'default'} sx={{ fontWeight: 600, textTransform: 'capitalize', height: 22, fontSize: '0.7rem' }} />
            </Box>
            {entry.timestamp && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                {new Date(entry.timestamp).toLocaleString()}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function OrderDetailDialog({ open, onClose, order, drivers }) {
  if (!order) return null;
  const driver = order.assignedDriver ? drivers.find(d => d.id === order.assignedDriver) : null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success('Order ID copied');
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = `${QR_API}${encodeURIComponent(order.id)}`;
    link.download = `order-${order.id?.slice(0, 10)}-qr.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const statusColorsMap = {
      pending: '#f59e0b', assigned: '#3b82f6', 'picked-up': '#8b5cf6',
      'in-transit': '#06b6d4', delivered: '#10b981', cancelled: '#ef4444',
    };
    printWindow.document.write(`
      <html><head><title>Order ${order.id?.slice(0, 10)}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto}
      h1{color:#2563eb}table{width:100%;border-collapse:collapse;margin:16px 0}
      td{padding:8px 12px;border:1px solid #e2e8f0}td:first-child{font-weight:600;color:#64748b;width:140px}
      .status{display:inline-block;padding:4px 12px;border-radius:20px;color:#fff;font-weight:600;font-size:12px}
      .qr{margin:20px 0}h2{color:#1e293b;margin-top:24px}
</style></head><body>
<h1>Order Receipt</h1>
<p style="color:#64748b">Order ID: ${order.id}</p>
<span class="status" style="background:${statusColorsMap[order.status] || '#6b7280'}">${order.status}</span>
<h2>Package Details</h2>
<table>${[
  ['Description', order.description || 'N/A'],
  ['Weight', order.weight ? `${order.weight} kg` : 'N/A'],
  ['Vehicle Type', order.vehicleType || 'N/A'],
  ['Priority', order.priority || 'Standard'],
  ['Cost', order.cost ? `₦${order.cost.toLocaleString()}` : 'N/A'],
  ['Payment', order.paymentStatus || 'Pending'],
].map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
<h2>Customer</h2>
<table>${[
  ['Name', order.customer || order.senderName || 'N/A'],
  ['Email', order.senderEmail || 'N/A'],
  ['Phone', order.senderPhone || order.recipientPhone || 'N/A'],
  ['Recipient', order.recipientName || 'N/A'],
].map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
<h2>Route</h2>
<table><tr><td>Origin</td><td>${order.origin || 'N/A'}</td></tr>
<tr><td>Destination</td><td>${order.destination || 'N/A'}</td></tr></table>
${driver ? `<h2>Driver</h2><table><tr><td>Name</td><td>${driver.name}</td></tr><tr><td>Phone</td><td>${driver.phone || 'N/A'}</td></tr></table>` : ''}
<div class="qr"><img src="${QR_API}${encodeURIComponent(order.id)}" width="150" height="150"/><p style="color:#94a3b8;font-size:12px">Scan to track: ${order.id}</p></div>
<p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:40px">LogiMove — Smart Logistics Platform</p>
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Package size={20} color="#2563eb" />
          <span>Order {order.id?.slice(0, 10)}</span>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Print"><IconButton onClick={handlePrint} size="small"><Printer size={18} /></IconButton></Tooltip>
          <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Status Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <StatusBadge status={order.status} />
            <Chip label={order.paymentStatus || 'pending'} size="small"
              color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }}
              icon={order.paymentStatus === 'paid' ? <CreditCard size={14} /> : <Clock size={14} />}
            />
            <Chip label={order.priority || 'Standard'} size="small" variant="outlined"
              color={order.priority === 'express' ? 'error' : order.priority === 'high' ? 'warning' : 'default'}
              sx={{ fontWeight: 600, textTransform: 'capitalize' }}
            />
          </Box>

          <Divider />

          {/* Package Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5 }}>
              <Package size={16} /> Package Info
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pl: 2 }}>
              {[
                { label: 'Weight', value: order.weight ? `${order.weight} kg` : 'N/A' },
                { label: 'Vehicle', value: order.vehicleType || 'N/A', capitalize: true },
                { label: 'Cost', value: order.cost ? `₦${order.cost.toLocaleString()}` : 'N/A' },
                { label: 'Created', value: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A' },
              ].map(({ label, value, capitalize }) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={capitalize ? { textTransform: 'capitalize' } : {}}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Customer */}
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5 }}>
              <User size={16} /> Customer
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pl: 2 }}>
              {[
                { label: 'Name', value: order.customer || order.senderName || 'N/A' },
                { label: 'Email', value: order.senderEmail || 'N/A' },
                { label: 'Phone', value: order.senderPhone || order.recipientPhone || 'N/A' },
                { label: 'Recipient', value: order.recipientName || 'N/A' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Route */}
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5 }}>
              <MapPin size={16} /> Route
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                <Typography variant="body2">{order.origin || 'N/A'}</Typography>
              </Box>
              <Box sx={{ width: 2, height: 24, bgcolor: 'divider', ml: 0.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                <Typography variant="body2">{order.destination || 'N/A'}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Tracking Timeline */}
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5 }}>
              <Navigation size={16} /> Tracking History
            </Typography>
            <Box sx={{ pl: 2 }}>
              <TrackingTimeline history={order.trackingHistory} />
            </Box>
          </Box>

          {/* Assigned Driver */}
          {driver && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5 }}>
                  <Truck size={16} /> Assigned Driver
                </Typography>
                <Box sx={{ pl: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.125rem',
                  }}>
                    {driver.name?.charAt(0)}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{driver.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {driver.phone} · {driver.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {order.description && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Description:</Typography>
                <Typography variant="body2" sx={{ bgcolor: 'grey.100', p: 1.5, borderRadius: 2 }}>{order.description}</Typography>
              </Box>
            </>
          )}

          <Divider />

          {/* QR Code Section */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <QrCode size={18} /> Scan to Track
            </Typography>
            <Box sx={{
              display: 'inline-block', p: 1.5, bgcolor: '#fff',
              borderRadius: 2, border: '2px dashed', borderColor: 'divider',
            }}>
              <img
                src={`${QR_API}${encodeURIComponent(order.id)}`}
                alt={`QR for ${order.id}`}
                style={{ width: 160, height: 160, display: 'block', borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">ID: {order.id}</Typography>
              <Tooltip title="Copy ID"><IconButton size="small" onClick={handleCopyId} sx={{ width: 24, height: 24 }}><Copy size={12} /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
              <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={handleDownloadQR}>
                Download QR
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DriverAssignment() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    Promise.all([fetchOrders(), fetchDrivers()]).then(([o, d]) => {
      setOrders(o);
      setDrivers(d);
      setPendingOrders(o.filter(ord => !ord.assignedDriver).map(ord => ord.id));
    });
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isDriverDrop = over.id.toString().startsWith('DRV-');
    if (isDriverDrop) {
      const orderId = active.id.toString();
      const driverId = over.id.toString();
      assignDriver(orderId, driverId).then(() => {
        toast.success(`Assigned ${orderId} to ${drivers.find(d => d.id === driverId)?.name}`);
        return Promise.all([fetchOrders(), fetchDrivers()]);
      }).then(([o, d]) => { setOrders(o); setDrivers(d); setPendingOrders(o.filter(ord => !ord.assignedDriver).map(ord => ord.id)); });
      return;
    }

    if (over.id.toString().startsWith('ORD-') && active.id.toString().startsWith('ORD-')) {
      setPendingOrders(prev => {
        const oldIdx = prev.indexOf(active.id.toString());
        const newIdx = prev.indexOf(over.id.toString());
        if (oldIdx === -1 || newIdx === -1) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const getOrder = (id) => orders.find(o => o.id === id);
  const getDriverForOrder = (orderId) => { const o = getOrder(orderId); return o?.assignedDriver ? drivers.find(d => d.id === o.assignedDriver) : null; };

  const openDetail = (order) => { setSelectedOrder(order); setDetailOpen(true); };

  const unassignedOrders = orders.filter(ord => !ord.assignedDriver);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4">Order Assignment</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {unassignedOrders.length} unassigned · {orders.filter(o => o.assignedDriver).length} assigned · {drivers.filter(d => d.status === 'available').length} drivers available
          </Typography>
        </Box>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Package size={18} /> Unassigned Orders ({pendingOrders.length})
            </Typography>
            <SortableContext items={pendingOrders} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 120 }}>
                {pendingOrders.map(id => {
                  const order = getOrder(id);
                  if (!order) return null;
                  return (
                    <SortableItem key={id} id={id}>
                      <Box
                        sx={{
                          p: 1.5, borderRadius: 2, cursor: 'grab', border: '1px solid',
                          borderColor: 'divider', bgcolor: 'background.paper',
                          '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                          '&:active': { cursor: 'grabbing' },
                          transition: 'all 0.2s',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600}>{order.id}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <StatusBadge status={order.status} />
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDetail(order); }} sx={{ width: 24, height: 24 }}>
                                <Eye size={14} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View QR">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDetail(order); }} sx={{ width: 24, height: 24 }}>
                                <QrCode size={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {order.customer} • ₦{order.cost?.toLocaleString()}
                        </Typography>
                      </Box>
                    </SortableItem>
                  );
                })}
                {pendingOrders.length === 0 && (
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 6 }}>All orders assigned</Typography>
                )}
              </Box>
            </SortableContext>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <User size={18} /> Available Drivers
            </Typography>
            {drivers.filter(d => d.status === 'available').map(driver => (
              <SortableContext key={driver.id} items={[driver.id]}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                        {driver.name?.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{driver.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{driver.id?.slice(0, 8)} • ⭐ {driver.rating}</Typography>
                      </Box>
                    </Box>
                    <SortableItem key={driver.id} id={driver.id}>
                      <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'primary.main', color: 'white', borderRadius: 1.5, fontSize: '0.75rem', cursor: 'grab', '&:active': { cursor: 'grabbing' }, '&:hover': { bgcolor: 'primary.dark' }, transition: 'background 0.2s' }}>
                        Drop here
                      </Box>
                    </SortableItem>
                  </Box>
                  <Typography variant="caption" color="text.disabled">
                    {driver.totalDeliveries} deliveries • ₦{driver.earnings?.toLocaleString()} earned
                  </Typography>
                </Paper>
              </SortableContext>
            ))}
            {drivers.filter(d => d.status === 'available').length === 0 && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.disabled">No available drivers</Typography>
              </Paper>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Truck size={18} /> Assigned Deliveries
            </Typography>
            {orders.filter(o => o.assignedDriver).map(order => {
              const driver = getDriverForOrder(order.id);
              return (
                <Paper key={order.id} sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{order.id?.slice(0, 10)}</Typography>
                      <StatusBadge status={order.status} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View details & QR">
                        <IconButton size="small" onClick={() => openDetail(order)} sx={{ width: 24, height: 24 }}>
                          <Eye size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.disabled">Driver:</Typography>
                    <Typography variant="caption" color="primary" fontWeight={600}>{driver?.name || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.disabled">•</Typography>
                    <Typography variant="caption" color="text.disabled">₦{order.cost?.toLocaleString()}</Typography>
                  </Box>
                </Paper>
              );
            })}
            {orders.filter(o => o.assignedDriver).length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>No assigned deliveries yet</Typography>
            )}
          </Box>
        </Box>
      </DndContext>

      <OrderDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} order={selectedOrder} drivers={drivers} />
    </Box>
  );
}
