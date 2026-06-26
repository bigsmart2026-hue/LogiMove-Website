import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function MapContainer({ center = [6.5244, 3.3792], zoom = 6, markers = [], polyline, className = 'h-80 w-full rounded-lg' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const ACCENT = 'hsl(8, 85%, 55%)';

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttr = '&copy; OpenStreetMap';

  const invalidate = () => {
    if (mapInstance.current) mapInstance.current.invalidateSize();
  };

  useEffect(() => {
    let cleanup = false;
    let timeout = setTimeout(() => {
      if (!cleanup) setFailed(true);
    }, 8000);
    import('leaflet/dist/leaflet.css').then(() => import('leaflet')).then((L) => {
      if (cleanup || mapInstance.current) return;
      clearTimeout(timeout);
      const map = L.map(mapRef.current, { zoomControl: true }).setView(center, zoom);
      L.tileLayer(tileUrl, { attribution: tileAttr, maxZoom: 19 }).addTo(map);
      mapInstance.current = map;
      setLoaded(true);
      [100, 300, 600, 1000].forEach(ms => setTimeout(invalidate, ms));
      if (mapRef.current) {
        resizeObserverRef.current = new ResizeObserver(invalidate);
        resizeObserverRef.current.observe(mapRef.current);
      }
    }).catch(() => { if (!cleanup) { clearTimeout(timeout); setFailed(true); } });
    return () => {
      cleanup = true;
      clearTimeout(timeout);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [tileUrl, tileAttr]);

  useEffect(() => {
    if (!mapInstance.current) return;
    invalidate();
    mapInstance.current.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstance.current) return;
    invalidate();
    import('leaflet').then((L) => {
      markersRef.current.forEach(m => mapInstance.current?.removeLayer(m));
      markersRef.current = [];
      markers.forEach(({ lat, lng, label, color = ACCENT }) => {
        const icon = L.divIcon({
          html: `<div style="background:${color};color:white;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Lexend','Segoe UI',system-ui,sans-serif;white-space:nowrap;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label || ''}</div>`,
          className: '', iconSize: [24, 24], iconAnchor: [12, 12],
        });
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
        polylineRef.current = L.polyline(latlngs, {
          color: ACCENT, weight: 3, opacity: 0.7,
        }).addTo(mapInstance.current);
        mapInstance.current.fitBounds(polylineRef.current.getBounds().pad(0.1));
      }
    });
  }, [polyline]);

  const onlineCount = markers.filter(m => m.color === ACCENT || m.color === '#22c55e').length;
  const warningCount = markers.filter(m => m.color === '#f59e0b' || m.color === 'hsl(38, 92%, 50%)').length;

  return (
    <div style={{ position: 'relative', background: 'var(--color-bg-secondary)', minHeight: 280, height: '100%' }}>
      {/* Map container */}
      <div ref={mapRef} className={className} style={{ height: '100%', minHeight: 280 }} />

      {/* Loading skeleton */}
      {!loaded && !failed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-secondary)',
          zIndex: 400,
          gap: 12,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-border)', borderTopColor: ACCENT, animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Loading map tiles...</span>
        </div>
      )}

      {/* Fallback when map fails to load */}
      {failed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-secondary)',
          zIndex: 400,
          gap: 8,
          padding: 24,
        }}>
          <MapPin size={24} color="var(--color-accent-primary)" />
          <span style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {markers.length} {markers.length === 1 ? 'asset' : 'assets'} tracked
          </span>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.6rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            Map tiles unavailable &middot; showing fleet positions
          </span>
          {markers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, maxWidth: 320, justifyContent: 'center' }}>
              {markers.slice(0, 8).map((m, i) => (
                <span key={i} style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.55rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {m.label}
                </span>
              ))}
              {markers.length > 8 && (
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)' }}>
                  +{markers.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top-left overlay panel */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        padding: '8px 10px',
        zIndex: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: 2 }}>
          Fleet Overview
        </div>
        <div style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {markers.length} asset{markers.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      {/* Bottom-right legend */}
      {(onlineCount > 0 || warningCount > 0) && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '4px 8px',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {onlineCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
              {onlineCount}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(38, 92%, 50%)' }} />
              {warningCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
