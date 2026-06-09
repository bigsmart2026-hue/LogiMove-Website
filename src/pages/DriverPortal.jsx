import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, fetchDrivers, updateOrder, addActivityLog, updateDriverLocation } from '../firebase/services';
import StatusBadge from '../components/StatusBadge';

export default function DriverPortal() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPOD, setShowPOD] = useState(false);
  const [podData, setPodData] = useState({ signature: null, photo: null, note: '' });
  const signatureRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');

  const loadData = () => Promise.all([fetchOrders(), fetchDrivers()]).then(([o, d]) => { setOrders(o); setDrivers(d); });
  useEffect(() => { loadData(); }, []);

  const driver = drivers.find(drv => drv.email === user?.email) || drivers.find(drv => drv.id === user?.userId) || drivers[0];
  const driverOrders = orders.filter(o => o.assignedDriver === driver?.id);
  const activeOrderIds = useRef([]);

  useEffect(() => {
    activeOrderIds.current = driverOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(o => o.id);
  }, [driverOrders]);

  // Real-time location tracking — updates user profile and active delivery orders
  useEffect(() => {
    let watchId = null;
    if (driver) {
      const doUpdateLocation = (lat, lng) => {
        updateDriverLocation(user.userId, lat, lng);
        const ids = activeOrderIds.current;
        ids.forEach(orderId => {
          updateOrder(orderId, { currentLocation: { lat, lng, updatedAt: new Date().toISOString() } });
        });
      };
      navigator.geolocation.getCurrentPosition(
        (pos) => doUpdateLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true }
      );
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          doUpdateLocation(pos.coords.latitude, pos.coords.longitude);
          setLocationStatus('live');
        },
        () => setLocationStatus('unavailable'),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [driver, user?.userId]);

  const startSignature = (e) => { setIsDrawing(true); const ctx = signatureRef.current?.getContext('2d'); if (ctx) { ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); } };
  const drawSignature = (e) => { if (!isDrawing || !signatureRef.current) return; const ctx = signatureRef.current.getContext('2d'); if (ctx) { ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke(); } };
  const endSignature = () => setIsDrawing(false);
  const clearSignature = () => { const ctx = signatureRef.current?.getContext('2d'); if (ctx) { ctx.clearRect(0, 0, 300, 150); } };

  const handleDeliveryConfirm = async () => {
    const dataURL = signatureRef.current?.toDataURL();
    await updateOrder(selectedOrder.id, { status: 'delivered', podSignature: dataURL, podNote: podData.note, podPhoto: podData.photo });
    await addActivityLog(`Delivery confirmed for ${selectedOrder.id}`);
    toast.success(`Delivery confirmed for ${selectedOrder.id}!`);
    setPodData({ signature: dataURL, photo: null, note: '' });
    setShowPOD(false);
    setSelectedOrder(null);
    clearSignature();
    loadData();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateOrder(orderId, { status: newStatus });
    await addActivityLog(`Order ${orderId}: Status updated to ${newStatus}`);
    toast.success(`${orderId}: Status updated to ${newStatus}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Driver Portal</h1>
        {driver && <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">{driver.name.charAt(0)}</div><div><p className="text-sm font-medium">{driver.name}</p><p className="text-xs text-gray-500">⭐ {driver.rating} • ₦{driver.earnings?.toLocaleString()}</p><p className={`text-xs mt-0.5 ${locationStatus === 'live' ? 'text-green-500' : 'text-gray-400'}`}>{locationStatus === 'live' ? '🟢 Live Tracking' : locationStatus === 'unavailable' ? '🔴 Location Off' : '⏳ Acquiring GPS...'}</p></div></div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-sm text-gray-500">Assigned Deliveries</p><p className="text-2xl font-bold text-gray-900">{driverOrders.length}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-sm text-gray-500">Completed Today</p><p className="text-2xl font-bold text-green-600">{driverOrders.filter(o => o.status === 'delivered').length}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-sm text-gray-500">Total Earnings</p><p className="text-2xl font-bold text-blue-600">₦{driverOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.cost, 0).toLocaleString()}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">My Deliveries</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100"><th className="text-left py-3 px-4 font-medium text-gray-500">Order</th><th className="text-left py-3 px-4 font-medium text-gray-500">Route</th><th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th><th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th></tr></thead>
            <tbody>
              {driverOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}</td>
                  <td className="py-3 px-4 text-gray-900">₦{order.cost?.toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {order.status === 'picked-up' && <button onClick={() => handleStatusUpdate(order.id, 'in-transit')} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">Start Transit</button>}
                      {order.status === 'in-transit' && <button onClick={() => { setSelectedOrder(order); setShowPOD(true); }} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200">Confirm Delivery</button>}
                      <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.destinationCoords?.lat},${order.destinationCoords?.lng}`, '_blank')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">GPS</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPOD && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPOD(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Proof of Delivery - {selectedOrder?.id}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Signature</label><canvas ref={signatureRef} width={300} height={150} className="border border-gray-300 rounded-lg w-full cursor-crosshair" onMouseDown={startSignature} onMouseMove={drawSignature} onMouseUp={endSignature} onMouseLeave={endSignature} /><button onClick={clearSignature} className="text-xs text-red-500 mt-1 hover:underline">Clear</button></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Delivery Photo</label><input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => { const result = ev.target.result; setPodData(p => ({ ...p, photo: result })); }; reader.readAsDataURL(e.target.files[0]); } }} className="w-full text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Delivery Note</label><textarea value={podData.note} onChange={(e) => { const v = e.target.value; setPodData(p => ({ ...p, note: v })); }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any notes..." /></div>
              {podData.photo && <img src={podData.photo} alt="Delivery" className="w-full h-32 object-cover rounded-lg" />}
              <button onClick={handleDeliveryConfirm} className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">Confirm Delivery</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
