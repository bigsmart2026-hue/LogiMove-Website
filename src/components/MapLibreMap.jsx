import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ACCENT = 'hsl(8, 85%, 55%)';

function toLngLat(p) {
  return [p[1], p[0]];
}

export default function MapLibreMap({ center = [6.5244, 3.3792], zoom = 6, markers = [], polyline, className = 'h-80 w-full rounded-lg', style }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const sourceAdded = useRef(false);
  const resizeObserverRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cleanup = false;
    let timeout = setTimeout(() => {
      if (!cleanup) setFailed(true);
    }, 8000);

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: toLngLat(center),
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    mapInstance.current = map;
    sourceAdded.current = false;

    map.on('load', () => {
      if (cleanup) return;
      clearTimeout(timeout);
      setLoaded(true);
      sourceAdded.current = false;
    });

    map.on('error', () => {
      if (!cleanup) {
        clearTimeout(timeout);
        setFailed(true);
      }
    });

    if (mapRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => { map.resize(); });
      resizeObserverRef.current.observe(mapRef.current);
    }

    return () => {
      cleanup = true;
      clearTimeout(timeout);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setCenter(toLngLat(center));
    mapInstance.current.setZoom(zoom);
  }, [center[0], center[1], zoom]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    markers.forEach(({ lat, lng, label, color = ACCENT }) => {
      const el = document.createElement('div');
      el.textContent = label || '';
      el.style.cssText = `background:${color};color:white;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Lexend','Segoe UI',system-ui,sans-serif;white-space:nowrap;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)`;
      const m = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [markers]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const updatePolyline = () => {
      if (!map.getSource('route')) {
        map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } });
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ACCENT, 'line-width': 3, 'line-opacity': 0.7 },
        });
      }

      if (polyline?.length > 1) {
        const coords = polyline.map(p => [p.lng, p.lat]);
        map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        });
        const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
        map.fitBounds(bounds, { padding: 40, maxZoom: 12 });
      } else {
        try { map.getSource('route').setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }); } catch {}
      }
    };

    if (map.isStyleLoaded()) {
      updatePolyline();
    } else {
      map.once('load', updatePolyline);
    }
  }, [polyline]);

  const onlineCount = markers.filter(m => m.color === ACCENT || m.color === '#22c55e').length;
  const warningCount = markers.filter(m => m.color === '#f59e0b' || m.color === 'hsl(38, 92%, 50%)').length;

  return (
    <div style={{ position: 'relative', background: 'var(--color-bg-secondary)', ...style }}>
      <div ref={mapRef} className={className} />

      {!loaded && !failed && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)',
          zIndex: 400, gap: 12,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-border)', borderTopColor: ACCENT, animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Loading map tiles...</span>
        </div>
      )}

      {failed && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)',
          zIndex: 400, gap: 8, padding: 24,
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
                  fontFamily: '"Inter", sans-serif', fontSize: '0.55rem',
                  padding: '2px 6px', borderRadius: 4,
                  background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)',
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

      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: 6, padding: '8px 10px', zIndex: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: 2 }}>
          Fleet Overview
        </div>
        <div style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {markers.length} asset{markers.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      {(onlineCount > 0 || warningCount > 0) && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          borderRadius: 6, padding: '4px 8px', zIndex: 500,
          display: 'flex', alignItems: 'center', gap: 8,
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
