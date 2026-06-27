import { useState, useEffect, useRef } from 'react';
import { fetchOrders, generateRoute, subscribeToOrder, subscribeToDriverLocation } from '../firebase/services';
import MapLibreMap from '../components/MapLibreMap';
import StatusBadge from '../components/StatusBadge';

export default function Tracking() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [route, setRoute] = useState([]);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const unsubOrder = useRef(null);
  const unsubDriver = useRef(null);

  useEffect(() => { fetchOrders().then(setOrders); }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (unsubOrder.current) unsubOrder.current();
      if (unsubDriver.current) unsubDriver.current();
    };
  }, []);

  const startTracking = (order) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (unsubOrder.current) unsubOrder.current();
    if (unsubDriver.current) unsubDriver.current();

    setSelectedOrder(order);

    if (order.currentLocation) {
      setCurrentPos(order.currentLocation);
      if (order.coordinates && order.destinationCoords) {
        const generated = generateRoute(
          { lat: order.coordinates.lat, lng: order.coordinates.lng },
          { lat: order.destinationCoords.lat, lng: order.destinationCoords.lng }
        );
        setRoute(generated);
      }
      const totalDist = order.coordinates && order.destinationCoords
        ? Math.sqrt(
            (order.destinationCoords.lat - order.coordinates.lat) ** 2 +
            (order.destinationCoords.lng - order.coordinates.lng) ** 2
          )
        : 1;
      const currentDist = order.coordinates
        ? Math.sqrt(
            (order.currentLocation.lat - order.coordinates.lat) ** 2 +
            (order.currentLocation.lng - order.coordinates.lng) ** 2
          )
        : 0;
      setProgress(Math.min(100, Math.round((currentDist / totalDist) * 100)));
    } else if (order.coordinates && order.destinationCoords) {
      const from = order.coordinates;
      const to = order.destinationCoords;
      const generated = generateRoute(from, to);
      setRoute(generated);
      setProgress(0);
      setCurrentPos(generated[0]);
      let step = 0;
      intervalRef.current = setInterval(() => {
        step++;
        if (step >= generated.length) { clearInterval(intervalRef.current); return; }
        setCurrentPos(generated[step]);
        setProgress(Math.round((step / generated.length) * 100));
      }, 800);
    }

    // Real-time: listen for order updates
    unsubOrder.current = subscribeToOrder(order.id, (updated) => {
      setSelectedOrder(prev => prev ? { ...prev, ...updated } : updated);
      if (updated.currentLocation) {
        setCurrentPos(updated.currentLocation);
        if (updated.coordinates && updated.destinationCoords) {
          const totalDist =
            Math.sqrt(
              (updated.destinationCoords.lat - updated.coordinates.lat) ** 2 +
              (updated.destinationCoords.lng - updated.coordinates.lng) ** 2
            ) || 1;
          const currentDist =
            Math.sqrt(
              (updated.currentLocation.lat - updated.coordinates.lat) ** 2 +
              (updated.currentLocation.lng - updated.coordinates.lng) ** 2
            );
          setProgress(Math.min(100, Math.round((currentDist / totalDist) * 100)));
        }
      }
    });

    // Real-time: listen for driver location updates
    if (order.assignedDriver) {
      unsubDriver.current = subscribeToDriverLocation(order.assignedDriver, (location) => {
        if (location) setCurrentPos(location);
      });
    }
  };

  const mapMarkers = currentPos && selectedOrder ? [
    { lat: selectedOrder.coordinates.lat, lng: selectedOrder.coordinates.lng, label: 'Origin', color: 'blue' },
    { lat: currentPos.lat, lng: currentPos.lng, label: `Package (${progress}%)`, color: 'red' },
    { lat: selectedOrder.destinationCoords.lat, lng: selectedOrder.destinationCoords.lng, label: 'Destination', color: 'blue' },
  ] : [];

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold text-gray-900">Track Package</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <MapLibreMap center={selectedOrder ? [selectedOrder.coordinates.lat, selectedOrder.coordinates.lng] : [6.5244, 3.3792]} zoom={selectedOrder ? 6 : 6} markers={mapMarkers} polyline={route} className="h-72 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Select Order</h3>
            <select onChange={e => { const o = orders.find(o => o.id === e.target.value); if (o) startTracking(o); }} className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2">
              <option value="">Choose an order...</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.customer}</option>)}
            </select>
            {selectedOrder && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Order:</span><span className="font-medium">{selectedOrder.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={selectedOrder.status} /></div>
                <div className="flex justify-between"><span className="text-gray-500">From:</span><span className="font-medium text-right text-xs">{selectedOrder.origin}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">To:</span><span className="font-medium text-right text-xs">{selectedOrder.destination}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Progress:</span><span className="font-bold text-red-500 text-xs">{progress}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div className="bg-red-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                <div className="flex justify-between pt-0.5"><span className="text-[10px] text-gray-400">{selectedOrder.coordinates.lat.toFixed(2)}, {selectedOrder.coordinates.lng.toFixed(2)}</span><span className="text-[10px] text-gray-400">{selectedOrder.destinationCoords.lat.toFixed(2)}, {selectedOrder.destinationCoords.lng.toFixed(2)}</span></div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">All Orders</h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {orders.map(order => (
                <div key={order.id} onClick={() => startTracking(order)} className={`p-2.5 rounded-lg cursor-pointer text-xs border transition-colors ${selectedOrder?.id === order.id ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-center"><span className="font-medium text-xs">{order.id}</span><StatusBadge status={order.status} /></div>
                  <p className="text-gray-500 text-[10px] mt-0.5">{order.customer} • {order.origin?.split(',')[0]} → {order.destination?.split(',')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
