import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { fetchOrders, fetchDrivers, assignDriver } from '../firebase/services';
import StatusBadge from '../components/StatusBadge';

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`${isDragging ? 'opacity-50' : ''}`} {...attributes} {...listeners}>{children}</div>;
}

export default function DriverAssignment() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gray-900">Order Assignment</h1><p className="text-sm text-gray-500">Drag orders to assign them to drivers</p></div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Unassigned Orders ({pendingOrders.length})</h3>
            <SortableContext items={pendingOrders} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {pendingOrders.map(id => {
                  const order = getOrder(id);
                  if (!order) return null;
                  return (
                    <SortableItem key={id} id={id}>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing">
                        <div className="flex justify-between items-center"><span className="font-medium text-sm">{order.id}</span><StatusBadge status={order.status} /></div>
                        <p className="text-xs text-gray-500 mt-1">{order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}</p>
                        <p className="text-xs text-gray-400">{order.customer} • ₦{order.cost?.toLocaleString()}</p>
                      </div>
                    </SortableItem>
                  );
                })}
                {pendingOrders.length === 0 && <p className="text-sm text-gray-400 text-center py-8">All orders assigned</p>}
              </div>
            </SortableContext>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Available Drivers</h3>
            {drivers.filter(d => d.status === 'available').map(driver => (
              <SortableContext key={driver.id} items={[driver.id]}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{driver.name.charAt(0)}</div>
                      <div><p className="font-medium text-sm">{driver.name}</p><p className="text-xs text-gray-500">{driver.id} • ⭐ {driver.rating}</p></div>
                    </div>
                    <SortableItem key={driver.id} id={driver.id}>
                      <div className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200 cursor-grab active:cursor-grabbing">Drop here</div>
                    </SortableItem>
                  </div>
                  <p className="text-xs text-gray-400">{driver.totalDeliveries} deliveries • ₦{driver.earnings?.toLocaleString()} earned</p>
                </div>
              </SortableContext>
            ))}
            {drivers.filter(d => d.status === 'available').length === 0 && <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-gray-200">No available drivers</p>}

            <h3 className="font-semibold text-gray-900 pt-2">Assigned Deliveries</h3>
            {orders.filter(o => o.assignedDriver).map(order => {
              const driver = getDriverForOrder(order.id);
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center"><span className="font-medium text-sm">{order.id}</span><StatusBadge status={order.status} /></div>
                  <p className="text-xs text-gray-500 mt-1">{order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}</p>
                  <div className="flex items-center gap-2 mt-2"><span className="text-xs text-gray-400">Driver:</span><span className="text-xs font-medium text-blue-600">{driver?.name || 'N/A'}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
