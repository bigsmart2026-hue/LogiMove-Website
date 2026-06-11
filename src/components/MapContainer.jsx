import { useEffect, useRef } from 'react';

export default function MapContainer({ center = [6.5244, 3.3792], zoom = 6, markers = [], polyline, className = 'h-80 w-full rounded-xl' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const invalidate = () => {
    if (mapInstance.current) mapInstance.current.invalidateSize();
  };

  useEffect(() => {
    let cleanup = false;
    import('leaflet/dist/leaflet.css').then(() => import('leaflet')).then((L) => {
      if (cleanup || mapInstance.current) return;
      const map = L.map(mapRef.current, { zoomControl: true }).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      mapInstance.current = map;

      // Invalidate multiple times to ensure tiles render at correct size
      [100, 300, 600, 1000].forEach(ms => setTimeout(invalidate, ms));

      // Watch container resizes (critical for responsive/mobile layouts)
      if (mapRef.current) {
        resizeObserverRef.current = new ResizeObserver(invalidate);
        resizeObserverRef.current.observe(mapRef.current);
      }
    });
    return () => {
      cleanup = true;
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapInstance.current) return;
    invalidate();
    import('leaflet').then((L) => {
      markersRef.current.forEach(m => mapInstance.current?.removeLayer(m));
      markersRef.current = [];
      markers.forEach(({ lat, lng, label, color = 'blue' }) => {
        const icon = L.divIcon({ html: `<div style="background:${color === 'red' ? '#ef4444' : '#3b82f6'};color:white;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label || ''}</div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
        const m = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
        markersRef.current.push(m);
      });
    });
  }, [markers]);

  useEffect(() => {
    if (!mapInstance.current) return;
    invalidate();
    import('leaflet').then((L) => {
      if (polylineRef.current) { mapInstance.current.removeLayer(polylineRef.current); polylineRef.current = null; }
      if (polyline?.length > 1) {
        const latlngs = polyline.map(p => [p.lat, p.lng]);
        polylineRef.current = L.polyline(latlngs, { color: '#3b82f6', weight: 3, opacity: 0.7 }).addTo(mapInstance.current);
        mapInstance.current.fitBounds(polylineRef.current.getBounds().pad(0.1));
      }
    });
  }, [polyline]);

  return <div ref={mapRef} className={className} />;
}
