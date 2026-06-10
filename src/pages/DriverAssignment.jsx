import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { fetchOrders, fetchDrivers, assignDriver, updateOrderStatus } from '../firebase/services';
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
import { Eye, QrCode, X, MapPin, Package, User, Phone, CreditCard, Calendar, Navigation } from 'lucide-react';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`${isDragging ? 'opacity-50' : ''}`} {...attributes} {...listeners}>{children}</div>;
}

function OrderDetailDialog({ open, onClose, order, drivers }) {
  if (!order) return null;
  const driver = order.assignedDriver ? drivers.find(d => d.id === order.assignedDriver) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Order Details — {order.id?.slice(0, 10)}</span>
        <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge status={order.status} />
            <Chip label={order.paymentStatus || 'pending'} size="small" color={order.paymentStatus === 'paid' ? 'success' : 'warning'} variant="filled" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
          </Box>

          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <Package size={16} /> Package Info
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, pl: 3 }}>
            <Box><Typography variant="caption" color="text.secondary">Weight</Typography><Typography variant="body2" fontWeight={600}>{order.weight || 'N/A'} kg</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Vehicle</Typography><Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{order.vehicleType || 'N/A'}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Priority</Typography><Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{order.priority || 'Standard'}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Cost</Typography><Typography variant="body2" fontWeight={600}>₦{order.cost?.toLocaleString() || 'N/A'}</Typography></Box>
          </Box>

          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <User size={16} /> Customer
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, pl: 3 }}>
            <Box><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body2" fontWeight={600}>{order.customer || order.senderName || 'N/A'}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2" fontWeight={600}>{order.senderEmail || 'N/A'}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2" fontWeight={600}>{order.senderPhone || order.recipientPhone || 'N/A'}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Recipient</Typography><Typography variant="body2" fontWeight={600}>{order.recipientName || 'N/A'}</Typography></Box>
          </Box>

          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <MapPin size={16} /> Route
          </Typography>
          <Box sx={{ pl: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
              <Typography variant="body2">{order.origin || 'N/A'}</Typography>
            </Box>
            <Box sx={{ width: 1, height: 20, bgcolor: 'divider', ml: 0.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
              <Typography variant="body2">{order.destination || 'N/A'}</Typography>
            </Box>
          </Box>

          {driver && (
            <>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Navigation size={16} /> Assigned Driver
              </Typography>
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2" fontWeight={600}>{driver.name}</Typography>
                <Typography variant="caption" color="text.secondary">{driver.phone} · {driver.email}</Typography>
              </Box>
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <QrCode size={16} /> Scan to Track
            </Typography>
            <img src={`${QR_API}${encodeURIComponent(order.id)}`} alt={`QR for ${order.id}`} style={{ width: 140, height: 140, margin: '0 auto', borderRadius: 8 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Order ID: {order.id}</Typography>
          </Box>

          {order.description && (
            <Box><Typography variant="caption" color="text.secondary">Description:</Typography><Typography variant="body2">{order.description}</Typography></Box>
          )}
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
  const [qrOrder, setQrOrder] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    Promise.all([fetchOrders(), fetchDrivers()]).then(([o, d]) => {
      setOrders(o);
      setDrivers(d);
      setPendingOrders(o.filter(ord => !ord.assignedDriver).map(ord => ord.id));
    });
  }, []);

  const handleDragStart = () => {};

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Order Assignment</Typography>
        <Typography variant="body2" color="text.secondary">Drag orders to assign them to drivers</Typography>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Unassigned Orders ({pendingOrders.length})
            </Typography>
            <SortableContext items={pendingOrders} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pendingOrders.map(id => {
                  const order = getOrder(id);
                  if (!order) return null;
                  return (
                    <SortableItem key={id} id={id}>
                      <Box
                        sx={{
                          p: 1.5, borderRadius: 2, cursor: 'grab', border: '1px solid',
                          borderColor: 'divider', bgcolor: 'grey.50',
                          '&:hover': { borderColor: 'primary.main' },
                          '&:active': { cursor: 'grabbing' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600}>{order.id}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <StatusBadge status={order.status} />
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDetail(order); }} sx={{ width: 24, height: 24 }}>
                              <Eye size={14} />
                            </IconButton>
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
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>All orders assigned</Typography>
                )}
              </Box>
            </SortableContext>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Available Drivers</Typography>
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
                      <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'primary.main', color: 'white', borderRadius: 1.5, fontSize: '0.75rem', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
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

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>Assigned Deliveries</Typography>
            {orders.filter(o => o.assignedDriver).map(order => {
              const driver = getDriverForOrder(order.id);
              return (
                <Paper key={order.id} sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>{order.id?.slice(0, 10)}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <StatusBadge status={order.status} />
                      <IconButton size="small" onClick={() => openDetail(order)} sx={{ width: 24, height: 24 }}>
                        <Eye size={14} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.disabled">Driver:</Typography>
                    <Typography variant="caption" color="primary" fontWeight={600}>{driver?.name || 'N/A'}</Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </DndContext>

      <OrderDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} order={selectedOrder} drivers={drivers} />
    </Box>
  );
}
